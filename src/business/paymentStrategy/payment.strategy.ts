export interface PaymentStrategy {
  pay(amount: number, userId: string): Promise<{ success: boolean }>;
}
