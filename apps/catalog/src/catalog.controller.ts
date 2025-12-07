import { 
  Controller, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards 
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ApiTags, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '@app/auth/guards/role.guard'; 
import { Roles } from 'libs/common/src/decorators/role.decorator';
import { Role } from 'libs/common/src/enums/role.enum';
import { SwaggerConsumes } from 'libs/common/src/enums/swagger-consumes.enum'; 
import { 
  CreateProductDto, 
  UpdateProductDto, 
  ReserveInventoryDto, 
  RestockProductDto 
} from './dto/product-catalog.dto';
import { JwtAuthGuard } from '@app/auth/guards/access.guard';

@ApiTags('catalog')
@ApiBearerAuth('bearer')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async createProduct(@Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(dto);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalogService.updateProduct(Number(id), dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteProduct(@Param('id') id: string) {
    return this.catalogService.deleteProduct(Number(id));
  }

  @Post(':id/reserve')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async reserveInventory(
    @Param('id') id: string, 
    @Body() dto: ReserveInventoryDto
  ) {
    return this.catalogService.reserveInventory(Number(id), dto);
  }

  @Post(':id/restock')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async restockProduct(
    @Param('id') id: string, 
    @Body() dto: RestockProductDto
  ) {
    return this.catalogService.restockProduct(Number(id), dto);
  }
}
