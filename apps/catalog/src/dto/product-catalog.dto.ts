import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ProductStatus, ProductCategory } from '@prisma/client';

export class CreateProductDto {
  @IsString() 
  name: string;
  @IsOptional() 
  @IsString() 
  description?: string;
  @IsNumber() 
  price: number;
  @IsNumber() 
  stock: number;
  @IsEnum(ProductStatus) 
  status: ProductStatus;
  @IsEnum(ProductCategory) 
  category: ProductCategory;
}

export class UpdateProductDto {
  @IsOptional() 
  @IsString() 
  name?: string;
  @IsOptional() 
  @IsString() 
  description?: string;
  @IsOptional() 
  @IsNumber() 
  price?: number;
  @IsOptional() 
  @IsNumber() 
  stock?: number;
  @IsOptional() 
  @IsEnum(ProductStatus) 
  status?: ProductStatus;
  @IsOptional()
  @IsEnum(ProductCategory) 
  category?: ProductCategory;
}

export class ReserveInventoryDto {
  @IsNumber() 
  quantity: number;
}