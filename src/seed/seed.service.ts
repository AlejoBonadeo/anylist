import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SEED_USERS, SEED_ITEMS } from './data/seed-data';
import { ItemsService } from '../items/items.service';

@Injectable()
export class SeedService {
  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService
  ) {
    this.isProd = configService.get('NODE_ENV') === 'production';
  }

  async executeSeed() {
    if (this.isProd) {
      throw new BadRequestException('Cannot execute seed on production');
    }
    await this.deleteDatabase();
    const user = await this.loadUsers();
    await this.loadItems(user)

    return true;
  }

  private async deleteDatabase() {
    await this.itemsRepository.createQueryBuilder().delete().where({}).execute();

    await this.usersRepository.createQueryBuilder().delete().where({}).execute();
  }

  private async loadUsers(): Promise<User> {
    const users = [];
    for(const user of SEED_USERS) {
        users.push(await this.usersService.create(user))
    }
    return users[0]
  }

  private async loadItems(user: User): Promise<void> {
    for(const item of SEED_ITEMS) {
        await this.itemsService.create(item, user);
    }
  }
}
