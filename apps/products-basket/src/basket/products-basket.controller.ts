import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProductsBasketService } from './products-basket.service';
import { ApiTags, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '@app/auth/guards/role.guard';
import { Roles } from 'libs/common/src/decorators/role.decorator';
import { Role } from 'libs/common/src/enums/role.enum';
import { SwaggerConsumes } from 'libs/common/src/enums/swagger-consumes.enum';
import { JwtAuthGuard } from '@app/auth/guards/access.guard';
import { AddToBasketDto, UpdateQuantityDto } from '../dto/basket.dto';

@ApiTags('basket')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard) // protect all basket routes by default
@Controller('basket')
export class ProductsBasketController {
  constructor(private readonly basketService: ProductsBasketService) {}

  @Post('add')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async addToBasket(@Req() req, @Body() dto: AddToBasketDto) {
    return this.basketService.addToBasket(req.user.id, dto.productId, dto.quantity ?? 1);
  }

  @Put('quantity')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async updateQuantity(@Req() req, @Body() dto: UpdateQuantityDto) {
    return this.basketService.updateQuantity(req.user.id, dto.productId, dto.quantity);
  }

  @Delete('item/:productId')
  async removeFromBasket(@Req() req, @Param('productId') productId: string) {
    return this.basketService.removeFromBasket(req.user.id, Number(productId));
  }

  @Delete('clear')
  async clearBasket(@Req() req) {
    return this.basketService.clearBasket(req.user.id);
  }

  @Get()
  async getBasket(@Req() req) {
    return this.basketService.getBasket(req.user.id);
  }

  @Post('finalize')
  async finalizeBasket(@Req() req) {
    return this.basketService.finalizeBasket(req.user.id);
  }

  @Delete(':userId')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async deleteBasket(@Param('userId') userId: string) {
    return this.basketService.deleteBasket(Number(userId));
  }

  @Get('all')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async listBaskets() {
    return this.basketService.listBaskets();
  }
}
