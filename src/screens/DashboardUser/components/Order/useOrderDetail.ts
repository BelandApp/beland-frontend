import { useEffect, useState } from "react";
import { useNotify } from "src/hooks";
import { normalizeOrderStatus, STATUS_META } from "./orderStatus.config";
import { OrderService, ProductService } from "src/services";
import { OrderStatus, Product } from "src/types";
import { Order as ApiOrder } from "@services/OrderApiService";

export const useOrderDetail = (orderId?: string) => {
  const notify = useNotify();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(false);
  const [modalDelivery, setModalDelivery] = useState(false);
  const [modalRecollet, setModalRecollect] = useState(false);

  const status = normalizeOrderStatus(order?.status);

  const refresh = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const o = await OrderService.getOrder(orderId);
      setOrder(o);

      const items = (o as any)?.items ?? [];
      const result = await Promise.all(
        items.map(async (i: any) => ({
          id: i.product_id,
          product: await ProductService.getProduct(i.product_id),
        })),
      );

      setProducts(Object.fromEntries(result.map((r) => [r.id, r.product])));
    } catch {
      notify.error({ message: "No se pudo cargar la orden" });
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (next: OrderStatus) => {
    if (!orderId) return;
    setLoading(true);
    try {
      await OrderService.updateOrderStatus(orderId, next as any);
      await refresh();
      const meta = STATUS_META[next as keyof typeof STATUS_META] ?? {
        label: next,
      };
      notify.success({ message: `Estado actualizado a ${meta.label}` });
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (!orderId) return;
    notify.confirm({
      message: "¿Confirmar cancelar esta orden?",
      onConfirm: async () => {
        setLoading(true);
        try {
          await OrderService.cancelOrder(orderId);
          await refresh();
          notify.success({ message: "Orden cancelada" });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const deliverOrder = async (code: number) => {
    if (!orderId) return;
    setLoading(true);
    try {
      await OrderService.deliverOrder(orderId, code);
      await refresh();
      notify.success({ message: "Orden entregada correctamente" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [orderId]);

  return {
    order,
    products,
    status,
    loading,
    changeStatus,
    cancelOrder,
    deliverOrder,
    modalRecollet,
    setModalRecollect,
    modalDelivery,
    setModalDelivery,
  };
};
