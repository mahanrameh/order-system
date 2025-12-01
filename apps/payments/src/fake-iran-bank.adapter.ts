import { Injectable } from '@nestjs/common';

@Injectable()
export class FakeIranBankAdapter {
  async initiate(amount: number, currency: string, orderId: number) {
    const gatewayRef = `IRBANK_${orderId}_${Date.now()}`;
    const redirectUrl = `https://fake-iran-bank.example/pay?ref=${gatewayRef}&order=${orderId}&amount=${amount}&currency=${currency}`;
    return { gatewayRef, redirectUrl };
  }

  async verify(gatewayRef: string): Promise<{ status: 'SUCCESS' | 'FAILED' }> {
    const success = gatewayRef.length % 2 === 0;
    return { status: success ? 'SUCCESS' : 'FAILED' };
  }

  verifySignature(payload: any, signature: string): boolean {
    return !!signature;
  }
}
