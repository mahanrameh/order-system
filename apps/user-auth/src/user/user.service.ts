import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
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
import { UserRepository } from '../repositories/user.repository';
import { RabbitMqService } from 'libs/messaging';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly events: RabbitMqService, 
  ) {}

  async getUsers(dto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(dto);
    const users = await this.userRepo.findMany(skip, limit);
    const count = await this.userRepo.countAll();

    return { pagination: paginationGenerator(count, page, limit), users };
  }

  async getUserById(id: number) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException(NotFoundMessage.NotFoundUser);
    return user;
  }

  async updateUser(userId: number, dto: UpdateUserDto) {
    const username = dto.username ? dto.username.trim().toLowerCase() : undefined;
    const email = dto.email ? dto.email.trim().toLowerCase() : undefined;
    const phone = dto.phone ? dto.phone.trim() : undefined;

    const existingEmail = email ? await this.userRepo.findByEmail(email) : null;
    if (existingEmail && existingEmail.id !== userId) {
      throw new ConflictException(ConflictMessage.EmailAlreadyExists);
    }

    try {
      let hashedPassword: string | undefined;
      if (dto.password) {
        hashedPassword = await bcrypt.hash(dto.password, 12);
      }

      const user = await this.userRepo.updateUser(userId, {
        ...(username && { username }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(hashedPassword && { password: hashedPassword }),
      });

      await this.events.notify(
        user.id,
        'EMAIL',
        `Your profile has been updated successfully.`
      );

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
      throw new BadRequestException(AuthMessage.TryAgain);
    }
  }

  async changeUserRole(id: number) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException(NotFoundMessage.NotFoundUser);

    if (user.role === 'ADMIN') {
      return {
        message: PublicMessage.Updated,
        user,
      };
    }

    const newUser = await this.userRepo.changeRole(id, 'ADMIN');

    await this.events.notify(
      newUser.id,
      'EMAIL',
      `Your role has been changed to ADMIN.`
    );

    return {
      message: PublicMessage.Updated,
      user: newUser,
    };
  }

  async deleteUser(id: number) {
    const existing = await this.userRepo.findById(id);
    if (!existing) throw new NotFoundException(NotFoundMessage.NotFoundUser);

    const user = await this.userRepo.softDelete(id);

    await this.events.notify(
      user.id,
      'EMAIL',
      `Your account has been deleted.`
    );

    return {
      message: PublicMessage.Deleted,
      user,
    };
  }
}
