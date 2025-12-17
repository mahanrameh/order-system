import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto, VerifyPaymentDto, GatewayWebhookDto } from './dto/payments.dto';
import { JwtAuthGuard } from '@app/auth/guards/access.guard';
import { SwaggerConsumes } from 'libs/common/src/enums/swagger-consumes.enum';


@ApiTags('payments')
@ApiBearerAuth('bearer')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);
  constructor(private readonly paymentService: PaymentsService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Initiate a new payment' })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async initiate(@Req() req, @Body() dto: InitiatePaymentDto) {
    const payment = await this.paymentService.initiatePayment(req.user.id, dto.orderId, dto.amount);
    return { success: true, payment };
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify payment status explicitly' })
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verify(@Body() dto: VerifyPaymentDto) {
    const payment = await this.paymentService.verifyPayment(dto.paymentId);
    return { success: true, payment };
  }

  @Post('gateway/webhook')
  @ApiOperation({ summary: 'Gateway webhook callback (public - signed)' })
  async gatewayWebhook(@Headers('x-gateway-signature') signature: string | undefined, @Body() dto: GatewayWebhookDto) {

    if (!signature) {
      throw new BadRequestException('Missing signature header');
    }

    await this.paymentService['gateway'].verifyWebhookSignature(dto, signature);

    const result = await this.paymentService.handleGatewayWebhook(dto);
    return result;
  }
}