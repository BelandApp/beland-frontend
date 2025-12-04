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
import { apiRequest, getBackendErrorMessage } from "@/services/api";
import { CartService } from "@/services";
import {
  CreateOrderRequest,
  DeliveryAddress,
  OrderItem,
  Product,
} from "src/types";

export type DeliveryStep = "select" | "form" | "processing";
export type preOrderType = {
  products: any[];
  address: UserAddress;
  addressId: string;
};
export function useOrderDelivery(onOrderCreated?: (orderId: string) => void) {
  const [step, setStep] = useState<DeliveryStep>("select");
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [preOrder, setPreOrder] = useState<preOrderType | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState("");
  const notify = useNotify();
  const { items, clearCart } = useCartStore();
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
    setLoadingAddresses(true);
    try {
      const list = await addressService.getUserAddresses();
      setAddresses(list ?? []);
    } catch {
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  /** ---------------- CREATE ADDRESS ---------------- */
  const createAddress = async (
    address: DeliveryAddress
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
      // Obtener datos actualizados del backend antes de confirmar
      const cart = await CartService.getCart();
      const backendItems = cart.items.map((item: any) => ({
        id: item.product_id,
        name: item.product?.name || "Producto",
        price: item.unit_price,
        quantity: item.quantity,
        image: item.product?.image_url,
      }));

      setSelectedAddress(address);
      setSelectedAddressId(id);
      setPreOrder({
        products: backendItems, // Usar items del backend
        address: address,
        addressId: id,
      });
      setStep("processing");
    } catch (e) {
      notify.error({ message: getBackendErrorMessage(e) });
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

    await requireAuth(async () => {
      try {
        // Obtener carrito del backend como fuente de verdad
        const cart = await CartService.getCart();

        // Actualizar dirección del carrito
        await apiRequest(
          `/carts/address/${cart.id}?address_id=${selectedAddressId}`,
          {
            method: "PUT",
          }
        );

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

        notify.success({ message: "Orden creada!" });
        clearCart();
        onOrderCreated?.(order.id);
        result = true;
      } catch (e) {
        notify.error({ message: getBackendErrorMessage(e) });
        setStep("select");
      }
    });
    return result;
  }, [items, selectedAddress, selectedAddressId]);

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
    loadingAddresses,
    preOrder,
    showLocationModal,
    detectedCountry,
    setShowLocationModal,

    loadAddresses,

    createAddress,
    createAndContinue,
    selectAddress,
    submitOrder,

    cancelAddressCreation,
  };
}

//! CODIGO LEGACY VER SI ES NECESARIO
// try {
//   const hasDelivery =
//     newOrder &&
//     ((newOrder as any).deliveryAddress || (newOrder as any).delivery_address);

//   const shouldForceAttach = !!(newOrder as any).__get_failed || !hasDelivery;

//   if (shouldForceAttach) {
//     let fallbackAddress: any = undefined;
//     if (addressId) {
//       fallbackAddress = userAddresses.find((a) => a.id === addressId);
//     }

//     if (!fallbackAddress && deliveryAddress) {
//       fallbackAddress = {
//         addressLine1: deliveryAddress.street,
//         addressLine2: deliveryAddress.additionalInfo || "",
//         city: deliveryAddress.city,
//         state: (deliveryAddress as any).state || "",
//         postalCode: (deliveryAddress as any).zipCode || "",
//         country: deliveryAddress.country,
//         latitude: (deliveryAddress as any).latitude,
//         longitude: (deliveryAddress as any).longitude,
//         phone: (deliveryAddress as any).phone || undefined,
//       };
//     }

//     if (!fallbackAddress && (orderRequest as any).deliveryAddress) {
//       const od = (orderRequest as any).deliveryAddress;
//       fallbackAddress = {
//         addressLine1: od.street,
//         addressLine2: od.additionalInfo || "",
//         city: od.city,
//         state: od.state || "",
//         postalCode: od.zipCode || "",
//         country: od.country,
//         latitude: od.latitude,
//         longitude: od.longitude,
//         phone: od.phone || undefined,
//       };
//     }

//     if (fallbackAddress) {
//       const normalized = {
//         street:
//           fallbackAddress.addressLine1 ||
//           fallbackAddress.address_line_1 ||
//           fallbackAddress.street ||
//           "",
//         additionalInfo:
//           fallbackAddress.addressLine2 ||
//           fallbackAddress.address_line_2 ||
//           fallbackAddress.additionalInfo ||
//           "",
//         city: fallbackAddress.city || fallbackAddress.town || "",
//         state: fallbackAddress.state || fallbackAddress.province || "",
//         zipCode:
//           fallbackAddress.postalCode ||
//           fallbackAddress.postal_code ||
//           fallbackAddress.zip ||
//           "",
//         country: fallbackAddress.country || "",
//         latitude: fallbackAddress.latitude,
//         longitude: fallbackAddress.longitude,
//         phone: fallbackAddress.phone,
//       };

//       const patched: any = { ...(newOrder as any) };
//       patched.deliveryAddress = normalized;
//       patched.delivery_address = normalized;
//       try {
//         patched.__attached_fallback = true;
//       } catch (e) {}
//       newOrder = patched as any;
//     }
//   }
// } catch (attachErr) {
//   // Failed to attach fallback deliveryAddress
// }
