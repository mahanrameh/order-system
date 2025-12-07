import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Pagination } from 'libs/common/src/decorators/pagination.decorator';
import { PaginationDto } from 'libs/common/src/dtos/pagination.dto';
import { paginationSolver, paginationGenerator } from 'libs/common/src/utils/pagination.util';
import { ProductCategory } from 'libs/prisma/generated';

@ApiBearerAuth('bearer')
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.productService.getProduct(Number(id));
  }

  @Get()
  @Pagination()
  async listProducts(@Query() paginationDto: PaginationDto) {
    const { skip, limit, page } = paginationSolver(paginationDto);
    const products = await this.productService.listProducts(skip, limit);
    const count = await this.productService.countProducts();

    return {
      pagination: paginationGenerator(count, page, limit),
      products,
    };
  }

  
  @Get('search')
  @Pagination()
  async searchProducts(
    @Query() paginationDto: PaginationDto,
    @Query('category') category?: ProductCategory,
    @Query('query') query?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    const { skip, limit, page } = paginationSolver(paginationDto);

    const filters = {
      category,
      nameQuery: query,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    };

    const products = await this.productService.getProductsByFilter(skip, limit, filters);
    const count = await this.productService.countProducts();

    return {
      pagination: paginationGenerator(count, page, limit),
      products,
    };
  }


   
}
