import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {

  async findAll(): Promise<User[]> {
    return [];
  }

  findOne(id: number) {
   throw new Error(``)
  }

  block(id: string) {
    return `This action removes a #${id} user`;
  }
}
