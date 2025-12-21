import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { OrderStatus } from 'libs/prisma/generated';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({enum: OrderStatus, enumName: 'Order status'})
  @IsEnum(OrderStatus)
  status: OrderStatus;
}