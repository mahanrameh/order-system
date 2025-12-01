import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min, IsString, IsEnum } from 'class-validator';

export class InitiatePaymentDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 101, description: 'Order ID' })
  @IsInt()
  orderId: number;

  @ApiProperty({ example: 250000, description: 'Amount to be paid in IRR' })
  @IsNumber()
  @Min(1)
  amount: number;
}

export enum GatewayStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export class PaymentWebhookDto {
  @ApiProperty({ example: 123, description: 'Payment ID from your system' })
  @IsInt()
  paymentId: number;

  @ApiProperty({ example: 'IRBANK_101_1732960000', description: 'Reference returned by fake Iranian gateway' })
  @IsString()
  gatewayRef: string;

  @ApiProperty({ enum: GatewayStatus, required: false, description: 'Optional status reported by gateway' })
  @IsEnum(GatewayStatus)
  status?: GatewayStatus;
}

export class VerifyPaymentDto {
  @ApiProperty({ example: 123, description: 'Payment ID to verify' })
  @IsInt()
  paymentId: number;
}
