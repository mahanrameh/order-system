import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrdersService {
  constructor(
    private prisma:PrismaService
  ){}
  getHello(): any {
    
  }
}
