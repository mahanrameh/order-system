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
  UseInterceptors,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '@app/auth/guards/role.guard';
import { Roles } from 'libs/common/src/decorators/role.decorator';
import { Role } from 'libs/common/src/enums/role.enum';
import { SwaggerConsumes } from 'libs/common/src/enums/swagger-consumes.enum';
import { JwtAuthGuard } from '@app/auth/guards/access.guard';
import { UpdateOrderStatusDto, CreateOrderDto } from '../src/dto/order.dto';
import { CurrentUser } from 'libs/common/src/decorators/user.decorator';

@ApiTags('orders')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('create')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async createOrder(@CurrentUser('sub') userId: number, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(userId, dto.address);
  }

  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string) {
    return this.ordersService.getOrder(Number(orderId));
  }

  @Get()
  async listUserOrders(@CurrentUser('sub') userId: number) {
    return this.ordersService.listUserOrders(userId);
  }

  @Put(':orderId/status')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(Number(orderId), dto.status);
  }

  @Delete(':orderId/cancel')
  async cancelOrder(@Param('orderId') orderId: string) {
    return this.ordersService.cancelOrder(Number(orderId));
  }

  // @Get('all')
  // @Roles(Role.ADMIN)
  // @UseGuards(RolesGuard)
  // async listAllOrders() {
  //   return this.ordersService.listAllOrders();
  // }
}
