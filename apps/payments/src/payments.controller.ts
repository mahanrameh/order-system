import {
  Body,
  Controller,
  Headers,
  Post,
  Get,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto, VerifyPaymentDto, PaymentWebhookDto } from './dto/payments.dto';
import { JwtAuthGuard } from '@app/auth/guards/access.guard';
import { RolesGuard } from '@app/auth/guards/role.guard';
import { Roles } from 'libs/common/src/decorators/role.decorator';
import { Role } from 'libs/common/src/enums/role.enum';
import { SwaggerConsumes } from 'libs/common/src/enums/swagger-consumes.enum';

@ApiTags('payments')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a new payment' })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async initiate(
    @Req() req,
    @Body() dto: InitiatePaymentDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    return this.payments.initiatePayment(req.user.id, dto.orderId, dto.amount, idempotencyKey);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle gateway webhook callback' })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async webhook(
    @Body() body: PaymentWebhookDto,
    @Headers('x-gateway-signature') signature: string,
  ) {
    return this.payments.handleWebhook(body, signature);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment status explicitly' })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verify(
    @Req() req,
    @Body() dto: VerifyPaymentDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    return this.payments.verifyPayment(dto.paymentId, idempotencyKey);
  }

}
