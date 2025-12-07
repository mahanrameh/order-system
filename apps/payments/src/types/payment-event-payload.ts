export interface PaymentEventPayload {
  paymentId: number;
  orderId: number;
  userId?: number;
  amount?: number;
  method?: string;
  status?: string;
  reason?: string;
}