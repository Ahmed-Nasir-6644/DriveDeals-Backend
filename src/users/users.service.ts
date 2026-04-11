import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository, StrictFilter } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { id } });
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async createUser(
    first_name: string,
    last_name: string,
    email: string,
    password: string,
  ): Promise<User> {
    const user = this.userRepository.create({
      first_name,
      last_name,
      email,
      password,
    });
    return await this.userRepository.save(user);
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  async updateUserName(email: string, firstName: string, lastName: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    user.first_name = firstName;
    user.last_name = lastName;
    return await this.userRepository.save(user);
  }
}
