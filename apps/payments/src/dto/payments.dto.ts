import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min, IsString, IsEnum, IsOptional, IsIn } from 'class-validator';

export class InitiatePaymentDto {
  @ApiProperty({ example: 101, description: 'Order ID for which payment is initiated' })
  @Type(() => Number)
  @IsInt()
  orderId: number;
}

export class VerifyPaymentDto {
  @ApiProperty({ example: 123, description: 'Payment ID to verify' })
  @Type(() => Number)
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
}


