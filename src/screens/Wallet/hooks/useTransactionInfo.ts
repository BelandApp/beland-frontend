import { useEffect, useState } from "react";
import { Transaction } from "../types";
import { CoreApiService } from "src/services";
import { Event } from "src/stores";
const _core = new CoreApiService();
export type ProductItems = {
  producto: string;
  cantidad: number;
  price: string;
  image_url: string;
};
export const useTransactionInfo = (transaction: Transaction) => {
  const [products, setProducts] = useState<ProductItems[] | null>(null);
  const [eventInfo, setEventInfo] = useState<Event | null>(null);
  useEffect(() => {
    const fetchSellInfo = async () => {
      const ORDER_ID = transaction?.reference;
      const cleanId = ORDER_ID.split(/-(.*)/s)[1];
      const res = await _core.get("orders/" + cleanId);
      setProducts(
        res.items.map((item: any) => ({
          producto: item.product.name,
          cantidad: item.quantity,
          price: item.unit_price,
          image_url: item.product.image_url,
        })),
      );
    };
    const featchEventInfo = async () => {
      const EVENT_ID = transaction?.reference;
      const cleanId = EVENT_ID.split(/-(.*)/s)[1];
      console.log("llamando eventos id:", cleanId);
      const res = await _core.get("event-pass/" + cleanId);
      setEventInfo(res);
    };
    if (transaction.type.code === "PURCHASE_BELAND") fetchSellInfo();
    if (transaction.type.code === "PURCHASE_EVENTPASS") featchEventInfo();
  }, []);
  return { productsInfo: products, eventInfo };
};
