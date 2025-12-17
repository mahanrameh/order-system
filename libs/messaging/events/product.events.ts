export interface ProductStockChangedEvent {
  productId: number;
  newStock: number;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'UNKNOWN';
}