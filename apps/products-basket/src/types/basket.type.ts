export type CartItem = {
  productId: number;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  totalPrice: number;
};