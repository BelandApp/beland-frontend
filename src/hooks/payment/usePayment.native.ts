import { useMobilePayment } from "src/business/paymentStrategy/payment.mobile";

export const usePayment = () => {
  return useMobilePayment();
};
