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
import { CurrentUser } from 'libs/common/src/decorators/user.decorator';

@ApiTags('basket')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard) 
@Controller('basket')
export class ProductsBasketController {
  constructor(private readonly basketService: ProductsBasketService) {}

  @Post('add')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async addToBasket(@CurrentUser('sub') userId: number, @Body() dto: AddToBasketDto) {
    return this.basketService.addToBasket(userId, dto.productId, dto.quantity ?? 1);
  }

  @Put('quantity')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async updateQuantity(@CurrentUser('sub') userId: number, @Body() dto: UpdateQuantityDto) {
    return this.basketService.updateQuantity(userId, dto.productId, dto.quantity);
  }

  @Delete('item/:productId')
  async removeFromBasket(@CurrentUser('sub') userId: number, @Param('productId') productId: string) {
    return this.basketService.removeFromBasket(userId, Number(productId));
  }

  @Delete('clear')
  async clearBasket(@CurrentUser('sub') userId: number) {
    return this.basketService.clearBasket(userId);
  }

  @Get()
  async getBasket(@CurrentUser('sub') userId: number) {
    return this.basketService.getBasket(userId);
  }

  @Delete(':userId')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async deleteBasket(@Param('userId') userId: string) {
    return this.basketService.deleteBasket(Number(userId));
  }

}
