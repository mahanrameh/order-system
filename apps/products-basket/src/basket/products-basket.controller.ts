import { 
  Controller, 
  Post, 
  Put, 
  Delete, 
  Get, 
  Body, 
  Param, 
  UseGuards 
} from '@nestjs/common';
import { ProductsBasketService } from './products-basket.service';
import { ApiTags, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '@app/auth/guards/role.guard';
import { Roles } from 'libs/common/src/decorators/role.decorator';
import { Role } from 'libs/common/src/enums/role.enum';
import { SwaggerConsumes } from 'libs/common/src/enums/swagger-consumes.enum';
import { JwtAuthGuard } from '@app/auth/guards/access.guard';

@ApiTags('basket')
@ApiBearerAuth('bearer')
@Controller('basket')
export class ProductsBasketController {
  constructor(private readonly basketService: ProductsBasketService) {}

  @Post('create/:userId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createBasket(@Param('userId') userId: string) {
    return this.basketService.createBasket(Number(userId));
  }

  @Post('add')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async addToBasket(
    @Body('userId') userId: number, 
    @Body('productId') productId: number,
    @Body('quantity') quantity?: number,
  ) {
    return this.basketService.addToBasket(userId, productId, quantity ?? 1);
  }

  @Post('remove')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async removeFromBasket(
    @Body('userId') userId: number, 
    @Body('productId') productId: number
  ) {
    return this.basketService.removeFromBasket(userId, productId);
  }

  @Put('update/:userId')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async updateBasket(
    @Param('userId') userId: string, 
    @Body('items') items: { productId: number; quantity: number }[]
  ) {
    return this.basketService.updateBasket(Number(userId), items);
  }

  @Get(':userId')
  async getBasket(@Param('userId') userId: string) {
    return this.basketService.getBasket(Number(userId));
  }

  @Delete(':userId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteBasket(@Param('userId') userId: string) {
    return this.basketService.deleteBasket(Number(userId));
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async listBaskets() {
    return this.basketService.listBaskets();
  }
}
