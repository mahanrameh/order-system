export interface OrderCreatedEvent {
  orderId: number;
  userId: number;
  totalAmount: number;
}

export interface OrderCancelledEvent {
  orderId: number;
  userId: number;
  totalAmount: number;
}

export interface OrderCompletedEvent {
  orderId: number;
  userId: number;
  totalAmount: number;
}

export interface OrderFailedEvent {
  orderId: number;
  userId: number;
  totalAmount: number;
  reason?: string;
}