import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class AddToBasketDto {
  @ApiProperty({ example: 42, description: 'ID of the product to add' })
  @IsInt()
  productId: number;

  @ApiProperty({ example: 2, required: false, description: 'Quantity to add (defaults to 1)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity: number = 1;
}

export class UpdateQuantityDto {
  @ApiProperty({ example: 42, description: 'ID of the product in the basket' })
  @IsInt()
  productId: number;

  @ApiProperty({ example: 3, description: 'New quantity for the product in the basket' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class RemoveFromBasketDto {
  @ApiProperty({ example: 42, description: 'ID of the product to remove from basket' })
  @IsInt()
  productId: number;
}
