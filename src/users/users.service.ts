import {
  BadRequestException,
  InternalServerErrorException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { SignUpInput } from '../auth/dto/sign-up.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { hashSync } from 'bcrypt';
import { NotFoundException } from '@nestjs/common';
import { ValidRoles } from '../auth/types/valid-roles.enum';
import { UpdateUserInput } from './dto/update-user.input';
import { Item } from '../items/entities/item.entity';
import { PaginationArgs, SearchArgs } from '../common/dto';

@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(signUpInput: SignUpInput): Promise<User> {
    try {
      const newUser = this.usersRepository.create({
        ...signUpInput,
        password: hashSync(signUpInput.password, 10),
      });

      return await this.usersRepository.save(newUser);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(
    roles: ValidRoles[],
    { limit, offset }: PaginationArgs,
    { search }: SearchArgs,
  ): Promise<User[]> {
    const queryBuilder = await this.usersRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset);

    if (search) {
      queryBuilder.andWhere('LOWER("fullName") like :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }
    if (roles.length) {
      queryBuilder
        .andWhere('ARRAY[roles] && ARRAY[:...roles]')
        .setParameter('roles', roles);
    }
    return queryBuilder.getMany();
  }

  async findOneByEmail(email: string) {
    try {
      return await this.usersRepository.findOneByOrFail({ email });
    } catch (error) {
      this.handleDBErrors({ code: '404-not-found', email });
    }
  }

  async findOneById(id: string) {
    try {
      return await this.usersRepository.findOneByOrFail({ id });
    } catch (error) {
      this.handleDBErrors({ code: '404-not-found', id });
    }
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    lastUpdatedBy: User,
  ): Promise<User> {
    try {
      const user = await this.usersRepository.preload({
        ...updateUserInput,
        id,
      });

      if (!user) throw new NotFoundException(`User with id ${id} not found`);

      if (updateUserInput.password) {
        user.password = hashSync(updateUserInput.password, 10);
      }
      user.lastUpdatedBy = lastUpdatedBy;

      return await this.usersRepository.save(user);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async block(id: string, user: User): Promise<User> {
    const userToBlock = await this.usersRepository.findOneBy({ id });

    userToBlock.isActive = false;
    userToBlock.lastUpdatedBy = user;

    return this.usersRepository.save(userToBlock);
  }

  async findLastUpdatedBy(id: string): Promise<User | null> {
    const { lastUpdatedBy } = await this.usersRepository.findOne({
      where: { id },
      relations: { lastUpdatedBy: true },
    });

    return lastUpdatedBy;
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail.replace('Key ', ''));
    }
    if (error.code === '404-not-found') {
      throw new NotFoundException(`${error.email || error.id} not found`);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
