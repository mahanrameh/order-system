import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { UpdateUserDto } from '../dto/user.dto';
import { PaginationDto } from 'libs/common/src/dtos/pagination.dto';
import {
  paginationSolver,
  paginationGenerator,
} from 'libs/common/src/utils/pagination.util';
import {
  AuthMessage,
  NotFoundMessage,
  PublicMessage,
  ConflictMessage,
} from 'libs/common/src/enums/message.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsers(dto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(dto);
    const users = await this.prisma.client.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    const count = await this.prisma.client.user.count();

    return { pagination: paginationGenerator(count, page, limit), users };
  }

  async getUserById(id: number) {
    const user = await this.prisma.client.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(NotFoundMessage.NotFoundUser);
    return user;
  }

  async updateUser(userId: number, dto: UpdateUserDto) {
    const username = dto.username ? dto.username.trim().toLowerCase() : undefined;
    const email = dto.email ? dto.email.trim().toLowerCase() : undefined;
    const phone = dto.phone ? dto.phone.trim() : undefined;

    const existingEmail = email
      ? await this.prisma.client.user.findUnique({ where: { email } })
      : null;
    if (existingEmail && existingEmail.id !== userId) {
      throw new ConflictException(ConflictMessage.EmailAlreadyExists);
    }

    try {
      let hashedPassword: string | undefined;
      if (dto.password) {
        hashedPassword = await bcrypt.hash(dto.password, 12);
      }

      const user = await this.prisma.client.user.update({
        where: { id: userId },
        data: {
          ...(username && { username }),
          ...(email && { email }),
          ...(phone && { phone }),
          ...(hashedPassword && { password: hashedPassword }),
        },
      });

      return {
        message: PublicMessage.Updated,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      };
    } catch (err) {
      console.error('Updating failed:', err);
      throw new BadRequestException(AuthMessage.TryAgain);
    }
  }

  async changeUserRole(id: number) {
    const user = await this.prisma.client.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(NotFoundMessage.NotFoundUser);

    if (user.role === 'ADMIN') {
      return {
        message: PublicMessage.Updated,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      };
    }

    const newUser = await this.prisma.client.user.update({
      where: { id },
      data: { role: 'ADMIN' },
    });

    return {
      message: PublicMessage.Updated,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    };
  }

  async deleteUser(id: number) {
    try {
      const user = await this.prisma.client.user.delete({ where: { id: id } });
      return {
        message: PublicMessage.Deleted,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      };
    } catch (err) {
      throw new NotFoundException(NotFoundMessage.NotFoundUser);
    }
  }
}
