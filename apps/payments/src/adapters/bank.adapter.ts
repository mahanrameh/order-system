export type BankVerifyResult = { status: 'SUCCESS' | 'FAILED'; raw?: any };

export abstract class BankAdapter {
  abstract initiate(amount: number, currency: string, orderId: number): Promise<{ gatewayRef: string; redirectUrl: string }>;
  abstract verify(gatewayRef: string): Promise<BankVerifyResult>;
  abstract verifyWebhookSignature(payload: any, signature: string): Promise<boolean>;
}