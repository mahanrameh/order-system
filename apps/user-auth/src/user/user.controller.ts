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
import { ApiConsumes } from '@nestjs/swagger';
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

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Pagination()
  getUsers(@Query() paginationDto: PaginationDto) {
    return this.userService.getUsers(paginationDto);
  }

  @Get(':id')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Roles(Role.ADMIN)
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @Patch('update')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  update(@Body() updateUserDto: UpdateUserDto, @CurrentUser() user: any) {
    return this.userService.updateUser(user.id, updateUserDto);
  }

  @Patch(':id/role')
  @ApiConsumes(SwaggerConsumes.Json, SwaggerConsumes.UrlEncoded)
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Roles(Role.ADMIN)
  changeUserRole(@Param('id', ParseIntPipe) id: number) {
    return this.userService.changeUserRole(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard, JwtAuthGuard)
  @Roles(Role.ADMIN)
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
