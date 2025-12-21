import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UserService } from './user.service';
import { Pagination } from 'libs/common/src/decorators/pagination.decorator';
import { PaginationDto } from 'libs/common/src/dtos/pagination.dto';
import { SwaggerConsumes } from 'libs/common/src/enums/swagger-consumes.enum';
import { UpdateUserDto } from '../dto/user.dto';
import { RolesGuard } from '@app/auth/guards/role.guard';
import { Roles } from 'libs/common/src/decorators/role.decorator';
import { Role } from 'libs/common/src/enums/role.enum';
import { CurrentUser } from 'libs/common/src/decorators/user.decorator';
import { JwtAuthGuard } from '@app/auth/guards/access.guard';

@ApiBearerAuth('bearer')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Pagination()
  getUsers(@Query() paginationDto: PaginationDto) {
    return this.userService.getUsers(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update')
  update(@Body() dto: UpdateUserDto, @CurrentUser() user: any, @CurrentUser('sub') userId: number) {
    return this.userService.updateUser(userId, dto);
  }

  @Patch(':id/role')
  @ApiConsumes(SwaggerConsumes.Json, SwaggerConsumes.UrlEncoded)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  changeUserRole(@Param('id', ParseIntPipe) id: number) {
    return this.userService.changeUserRole(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
