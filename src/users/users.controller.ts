import { Controller, Get, Request, Query, UseGuards, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { jwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserNameDto } from 'src/dtos/updateUserName.dto';
import { NotFoundException } from '@nestjs/common';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) {}

    @UseGuards(jwtAuthGuard)
    @Get('user')
    getUserProfile(@Request() req){
        
        return req.user;
    }

    @Post('update-name')
    async updateUserName(@Body() dto: UpdateUserNameDto) {
        return this.userService.updateUserName(dto.email, dto.firstName, dto.lastName);
    }
  @Get('get-by-email')
  async getUserByEmail(@Query('email') email: string) {
    if (!email) {
      throw new NotFoundException('Email query parameter is required');
    }

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
