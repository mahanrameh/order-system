import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min, IsString, IsEnum, IsOptional, IsIn } from 'class-validator';

export class InitiatePaymentDto {
  @ApiProperty({ example: 1, description: 'User ID initiating the payment' })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 101, description: 'Order ID for which payment is initiated' })
  @IsInt()
  orderId: number;

  @ApiProperty({ example: 250000, description: 'Amount to be paid (IRR)' })
  @IsNumber()
  @Min(1)
  amount: number;
}

export class VerifyPaymentDto {
  @ApiProperty({ example: 123, description: 'Payment ID to verify' })
  @IsInt()
  paymentId: number;
}


export class GatewayWebhookDto {
  @ApiProperty({ example: 'IRBANK_101_1732960000', description: 'Reference returned by gateway' })
  @IsString()
  gatewayRef: string;

  @ApiProperty({ example: 'ok', enum: ['ok', 'cancel'] })
  @IsIn(['ok', 'cancel'])
  status: 'ok' | 'cancel';

  @ApiProperty({ required: false, example: 1732960000 })
  @IsOptional()
  @IsInt()
  timestamp?: number;
}


