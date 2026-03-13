import { useEffect, useState } from "react";
import { Transaction } from "../types";
import { CoreApiService } from "src/services";
const _core = new CoreApiService();
export type InfoItems = {
  producto: string;
  cantidad: number;
};
export const useTransactionInfo = (transaction: Transaction) => {
  const [info, setInfo] = useState<InfoItems[] | null>(null);
  useEffect(() => {
    const fetchTransactionInfo = async () => {
      const ORDER_ID = transaction?.reference;
      const res = await _core.get("orders/" + ORDER_ID);
      setInfo(
        res.items.map((item: any) => ({
          producto: item.product.name,
          cantidad: item.quantity,
        })),
      );
    };
    if (transaction.type.name === "pago") fetchTransactionInfo();
  }, []);
  return { info };
};
