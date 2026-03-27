import { useWebPayment } from "src/business/paymentStrategy/payment.web";

export const usePayment = () => {
  return useWebPayment();
};
