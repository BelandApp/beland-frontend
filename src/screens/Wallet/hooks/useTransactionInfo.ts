import { useEffect, useState } from "react";
import { Transaction } from "../types";
import { CoreApiService } from "src/services";
const _core = new CoreApiService();
export type InfoItems = {
  producto: string;
  cantidad: number;
  price: string;
  image_url: string;
};
export const useTransactionInfo = (transaction: Transaction) => {
  const [info, setInfo] = useState<InfoItems[] | null>(null);
  useEffect(() => {
    const fetchTransactionInfo = async () => {
      const ORDER_ID = transaction?.reference;
      const cleanId = ORDER_ID.split(/-(.*)/s)[1];
      const res = await _core.get("orders/" + cleanId);
      setInfo(
        res.items.map((item: any) => ({
          producto: item.product.name,
          cantidad: item.quantity,
          price: item.unit_price,
          image_url: item.product.image_url,
        })),
      );
    };
    if (transaction.type.code === "PURCHASE_BELAND") fetchTransactionInfo();
  }, []);
  return { info };
};
