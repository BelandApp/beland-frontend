import { useState, useCallback } from "react";
import {
  addressService,
  CreateAddressRequest,
  UserAddress,
} from "@/services/addressService";
import { useOrdersStoreAPI } from "@/stores/useOrdersStoreAPI";
import { useCartStore } from "src/stores/cart/useCartStore";
import { useNotify } from "@/hooks";
import { useAuth } from "@/context";
import { getBackendErrorMessage } from "src/services";
import { CoreApiService } from "src/services/core/ApiService";

const core = new CoreApiService();
import { CartService } from "@/services";
import { CreateOrderRequest, DeliveryAddress } from "src/types";
import { COORDINATES_HAMONI } from "src/constants/deliveryCoordinats";

export type DeliveryStep = "select" | "form" | "processing" | "payment";
type OrderSubmitStatus = "idle" | "loading" | "success" | "error";
export type preOrderType = {
  products: any[];
  address: UserAddress;
  addressId: string;
  cost: number;
  duration_min: number;
  distance_km: number;
};

export function useOrderDelivery(onOrderCreated?: (orderId: string) => void) {
  const [step, setStep] = useState<DeliveryStep>("select");
  const [submitStatus, setSubmitStatus] = useState<OrderSubmitStatus>("idle");
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [preOrder, setPreOrder] = useState<preOrderType | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const notify = useNotify();
  const { items } = useCartStore();
  const { createOrder } = useOrdersStoreAPI();
  const { requireAuth } = useAuth();

  /** ---------------- HELPER: Validar ubicación en Ecuador ---------------- */
  const isEcuador = (country: string): boolean => {
    const normalized = country.toLowerCase().trim();
    return (
      normalized === "ecuador" || normalized === "ec" || normalized === "ecu"
    );
  };

  /** ---------------- LOAD ADDRESSES ---------------- */
  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const list = await addressService.getUserAddresses();
      console.log("Formato de address", list);
      setAddresses(list ?? []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /** ---------------- CREATE ADDRESS ---------------- */
  const createAddress = async (
    address: DeliveryAddress,
  ): Promise<string | null> => {
    const payload: CreateAddressRequest = {
      addressLine1: address.street,
      addressLine2: address.additionalInfo || undefined,
      city: address.city,
      state: address.state || undefined,
      postalCode: address.zipCode || undefined,
      country: address.country,
      latitude: address.latitude,
      longitude: address.longitude,
      isDefault: true,
    };

    try {
      const created = await addressService.createAddress(payload);
      setAddresses((prev) => [...prev, created]);
      notify.success({ message: "Dirección creada" });
      setStep("select");
      return created.id;
    } catch (e) {
      notify.error({ message: getBackendErrorMessage(e) });
      return null;
    }
  };

  /** ---------------- SELECT ADDRESS (PASO 1 → 3) ---------------- */
  const selectAddress = async (address: any, id: string) => {
    if (items.length === 0) {
      notify.error({ message: "El carrito está vacío." });
      return;
    }

    // Validar que la dirección sea de Ecuador
    if (!isEcuador(address.country)) {
      setDetectedCountry(address.country);
      setShowLocationModal(true);
      return;
    }

    try {
      setLoading(true);
      // Obtener datos actualizados del backend antes de confirmar
      const cart = await CartService.getCart();
      const backendItems = cart.items.map((item: any) => ({
        id: item.product_id,
        name: item.product?.name || "Producto",
        price: item.unit_price,
        quantity: item.quantity,
        image: item.product?.image_url,
      }));
      const deliveryCost = await CartService.estimateShipping({
        customerLat: address.latitude,
        customerLon: address.longitude,
        driverLat: COORDINATES_HAMONI[0],
        driverLon: COORDINATES_HAMONI[1],
      });
      setPreOrder({
        products: backendItems, // Usar items del backend
        address: address,
        addressId: id,
        cost: deliveryCost.cost || 1,
        duration_min: deliveryCost.durationMin,
        distance_km: deliveryCost.distanceKm,
      });
      // subtotal productos
      const itemsSubtotal = backendItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );
      // total final
      const total = itemsSubtotal + (deliveryCost.cost || 1);
      setSelectedAddress(address);
      setSelectedAddressId(id);
      setSubtotal(String(total));
      setStep("processing");
    } catch (e) {
      notify.error({ message: getBackendErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  };

  /** ---------------- CREATE AND SELECT (PASO 2 → 3) ---------------- */
  const createAndContinue = async (address: any) => {
    // Validar que la dirección sea de Ecuador antes de crear
    if (!isEcuador(address.country)) {
      setDetectedCountry(address.country);
      setShowLocationModal(true);
      return;
    }

    const id = await createAddress(address);
    if (!id) return;

    await selectAddress(address, id);
  };

  /** ---------------- SUBMIT ORDER (PASO 3) ---------------- */
  const submitOrder = useCallback(async () => {
    if (!selectedAddressId || !selectedAddress) {
      return notify.error({ message: "Selecciona una dirección" });
    }
    let result = false;
    setSubmitStatus("loading");
    await requireAuth(async () => {
      try {
        // Obtener carrito del backend como fuente de verdad
        const cart = await CartService.getCart();

        // Actualizar dirección del carrito
        await core.put(
          `/carts/address/${cart.id}?address_id=${selectedAddressId}`,
        );
        // Actualizar costo de envio
        await core.put(`carts/delivery/${cart.id}`, {
          duration_min: preOrder?.duration_min,
          distance_km: preOrder?.distance_km,
          delivery_cost: preOrder?.cost,
        });
        // Usar items del backend, no del store local
        const backendItems = cart.items.map((item: any) => ({
          id: item.product_id,
          productId: item.product_id,
          price: item.unit_price,
          quantity: item.quantity,
          subtotal: item.total_price,
          name: item.product?.name || "Producto",
          image: item.product?.image_url,
        }));

        const payload: CreateOrderRequest = {
          deliveryAddress: selectedAddress,
          deliveryType: "home",
          paymentMethod: "becoins",
          items: backendItems,
        };

        const order = await createOrder(payload);
        setSubmitStatus("success");
        notify.success({ message: "Orden creada!" });
        setTimeout(() => {
          onOrderCreated?.(order.id);
        }, 2500);
      } catch (e) {
        setSubmitStatus("error");
        notify.error({ message: getBackendErrorMessage(e) });
      }
    });
    return result;
  }, [selectedAddress, selectedAddressId]);
  /** ---------------- CANCEL PREORDER ---------------- */
  const cancelPreOrder = () => {
    setPreOrder(null);
    console.log("Cancelling preorder...");
    setSubmitStatus("idle");
    setStep("select");
  };
  /** ---------------- CANCEL BEHAVIOR ---------------- */
  const cancelAddressCreation = () => {
    notify.confirm({
      message: "¿Cancelar nueva dirección?",
      onConfirm: () => setStep("select"),
    });
  };

  return {
    step,
    setStep,
    addresses,
    setLoading,
    loading,
    preOrder,
    showLocationModal,
    detectedCountry,
    setShowLocationModal,
    subtotal,

    loadAddresses,
    setSubmitStatus,
    createAddress,
    createAndContinue,
    selectAddress,
    submitOrder,
    submitStatus,
    cancelAddressCreation,
    cancelPreOrder,
  };
}
