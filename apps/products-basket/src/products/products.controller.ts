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

  @Get('category/:category')
  @Pagination()
  async getProductsByCategory(
    @Param('category') category: ProductCategory,
    @Query() paginationDto: PaginationDto,
  ) {
    const { skip, limit, page } = paginationSolver(paginationDto);

    const products = await this.productService.listProducts(skip, limit);
    const filtered = products.filter(p => p.category === category);

    return {
      pagination: paginationGenerator(filtered.length, page, limit),
      products: filtered,
    };
  }

  @Get('search')
  @Pagination()
  async searchProducts(
    @Query('q') query: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const { skip, limit, page } = paginationSolver(paginationDto);
    const products = await this.productService.searchProductsByName(query);

    const paginated = products.slice(skip, skip + limit);
    return {
      pagination: paginationGenerator(products.length, page, limit),
      products: paginated,
    };
  }
   
  @Get('price-range')
  @Pagination()
  async getProductsByPriceRange(
    @Query('min') min: number,
    @Query('max') max: number,
    @Query() paginationDto: PaginationDto,
  ) {
    const { skip, limit, page } = paginationSolver(paginationDto);
    const products = await this.productService.getProductsByPriceRange(Number(min), Number(max));

    const paginated = products.slice(skip, skip + limit);
    return {
      pagination: paginationGenerator(products.length, page, limit),
      products: paginated,
    };
  }
}
