import * as crypto from 'crypto';
import { Injectable, BadRequestException } from '@nestjs/common';
import { BankAdapter, BankVerifyResult } from './bank.adapter';

@Injectable()
export class FakeIranBankAdapter extends BankAdapter {
  private readonly secret = process.env.BANK_SECRET || 'super-secret-key';
  private readonly algo = process.env.BANK_ALGO || 'sha256';

  async initiate(amount: number, currency: string, orderId: number) {
    const gatewayRef = `IRBANK_${orderId}_${Date.now()}`;
    const redirectUrl = `https://fake-iran-bank.example/pay?ref=${gatewayRef}&order=${orderId}&amount=${amount}&currency=${currency}`;
    return { gatewayRef, redirectUrl };
  }

  async verify(gatewayRef: string): Promise<BankVerifyResult> {
    const hmac = crypto.createHmac(this.algo, this.secret).update(gatewayRef).digest('hex');
    const success = parseInt(hmac.slice(0, 2), 16) % 2 === 0;
    return { status: success ? 'SUCCESS' : 'FAILED', raw: { hmac } };
  }

  async verifyWebhookSignature(payload: any, signature: string) {
    const serialized = JSON.stringify(payload);
    const signingToken = crypto.createHmac(this.algo, this.secret).update(serialized).digest('hex');
    if (signingToken !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }
    return true;
  }

  async buildSignedWebhook(payload: { gatewayRef: string; status: 'ok' | 'cancel'; timestamp?: number }) {
    const serialized = JSON.stringify(payload);
    const signature = crypto.createHmac(this.algo, this.secret).update(serialized).digest('hex');

    return {
      headers: {
        'x-gateway-signature': signature,
      },
      body: payload,
    };
  }
}