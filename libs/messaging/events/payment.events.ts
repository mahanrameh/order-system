export interface PaymentPendingEvent {
  paymentId: number;
  orderId: number;
  userId: number;
  amount: number;
  method: string;
}

export interface PaymentCompletedEvent {
  paymentId: number;
  orderId: number;
  userId: number;
  amount: number;
  method: string;
}

export interface PaymentFailedEvent {
  paymentId: number;
  orderId: number;
  userId: number;
  amount: number;
  method: string;
  reason: string;
}
