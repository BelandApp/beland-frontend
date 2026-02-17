import { useEffect, useState, useCallback } from "react";
import { OrderService } from "@services/core";
import { useNotify } from "src/hooks";
import { normalizeOrderStatus, OrderStatus } from "./orderStatus.config";
import { Order as ApiOrder, OrdedNormalized } from "@services/OrderApiService";
export const useOrdersAdmin = () => {
  const notify = useNotify();

  const [orders, setOrders] = useState<OrdedNormalized[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalDelivery, setModalDelivery] = useState(false);
  const [modalRecollet, setModalRecollect] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    minPrice: "",
    maxPrice: "",
    dateFrom: "",
    dateTo: "",
  });

  const loadOrders = useCallback(
    async (isRefresh = false, pageNumber = 1) => {
      if (isRefresh) setRefreshing(true);
      else if (pageNumber === 1) setLoading(true);
      else setIsFetchingMore(true);

      try {
        const queryParams: any = {
          page: pageNumber,
          limit: 10,
        };

        if (filters.status) queryParams.status = filters.status;
        if (filters.minPrice) queryParams.min_total = Number(filters.minPrice);
        if (filters.maxPrice) queryParams.max_total = Number(filters.maxPrice);
        if (filters.dateFrom)
          queryParams.fecha_desde = new Date(filters.dateFrom).toISOString();
        if (filters.dateTo)
          queryParams.fecha_hasta = new Date(filters.dateTo).toISOString();

        const res = await OrderService.getOrders(queryParams);
        const data = res.data;

        const normalized = data.map((order: ApiOrder) => ({
          ...order,
          normalizedStatus: normalizeOrderStatus(order.status),
        }));

        if (pageNumber === 1) {
          setOrders(normalized);
        } else {
          setOrders((prev) => [...prev, ...normalized]);
        }
        console.log("Tenemos total de paginas", res.total / 10);
        setTotalPages(Math.ceil(res?.total / 10) || 1);
        setPage(pageNumber);
      } catch (error) {
        notify.error({ message: "No se pudieron cargar las órdenes" });
        setOrders([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setIsFetchingMore(false);
      }
    },
    [filters],
  );

  const changeStatus = async (orderId: string, nextStatus: OrderStatus) => {
    if (nextStatus === "delivered") {
      setModalDelivery(true);
      return;
    }
    if (nextStatus === "recycled") {
      setModalRecollect(true);
      return;
    }
    setLoading(true);
    try {
      await OrderService.updateOrderStatus(orderId, nextStatus as OrderStatus);
      await loadOrders();
      notify.success({ message: "Estado actualizado correctamente" });
    } catch (err) {
      notify.error({ message: "No se pudo actualizar el estado" });
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    notify.confirm({
      message: "¿Confirmar cancelación?",
      onConfirm: async () => {
        setLoading(true);
        try {
          await OrderService.cancelOrder(orderId);
          await loadOrders();
          notify.success({ message: "Orden cancelada" });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const deliverOrder = async (
    orderId: string,
    code: number,
    weight?: number,
  ) => {
    setLoading(true);
    try {
      await OrderService.deliverOrder(orderId, code, weight);
      await loadOrders();
      notify.success({ message: "Orden entregada" });
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const recollectOrder = async (orderId: string, weight: number) => {
    setLoading(true);
    try {
      await OrderService.recollectOrder(orderId, weight);
      await loadOrders();
      notify.success({ message: "Orden Recolectada" });
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadOrders(false, 1);
  }, [filters]);

  return {
    orders,
    loading,
    refreshing,
    isFetchingMore,
    page,
    totalPages,
    setFilters,
    loadOrders,
    changeStatus,
    cancelOrder,
    deliverOrder,
    modalRecollet,
    setModalRecollect,
    modalDelivery,
    setModalDelivery,
    recollectOrder,
  };
};
