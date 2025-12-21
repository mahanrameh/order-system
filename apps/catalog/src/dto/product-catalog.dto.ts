import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsInt } from 'class-validator';
import { ProductCategory, ProductStatus } from 'libs/prisma/generated';
import {Type} from 'class-transformer'

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  price: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  stock: number;

  @ApiProperty({enum: ProductStatus, enumName: 'Product status'})
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @ApiProperty({enum: ProductCategory, enumName: 'Product category'})
  @IsEnum(ProductCategory)
  category: ProductCategory;
}

export class UpdateProductDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  price?: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discount?: number

  @ApiProperty({enum: ProductStatus, enumName: 'Product status'})
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({enum: ProductCategory, enumName: 'Product category'})
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;
}

export class ReserveInventoryDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  reason?: string; 
}

export class RestockProductDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsString()
  reason: string; 
}
