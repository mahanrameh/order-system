import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class AddToBasketDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  productId: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1;
}

export class UpdateQuantityDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  productId: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class RemoveFromBasketDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  productId: number;
}
