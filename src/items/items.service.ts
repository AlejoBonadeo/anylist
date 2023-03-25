import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateItemInput } from './dto/create-item.input';
import { UpdateItemInput } from './dto/update-item.input';
import { Item } from './entities/item.entity';
import { User } from '../users/entities/user.entity';
import { PaginationArgs, SearchArgs } from '../common/dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemsRepository.create({
      ...createItemInput,
      user,
    });
    return await this.itemsRepository.save(newItem);
  }

  async findAll(
    user: User,
    { limit, offset }: PaginationArgs,
    { search }: SearchArgs,
  ): Promise<Item[]> {
    const queryBuilder = this.itemsRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id });

    if (search) {
      queryBuilder.andWhere('LOWER(name) like :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!item || item.user.id !== user.id)
      throw new NotFoundException(`Item with id ${id} not found`);

    return item;
  }

  async update(
    id: string,
    updateItemInput: UpdateItemInput,
    user: User,
  ): Promise<Item> {
    await this.findOne(id, user);
    const item = await this.itemsRepository.preload(updateItemInput);

    if (!item) throw new NotFoundException(`Item with id ${id} not found`);

    return this.itemsRepository.save(item);
  }

  async remove(id: string, user: User): Promise<Item> {
    const item = await this.findOne(id, user);
    await this.itemsRepository.remove(item);
    return { ...item, id };
  }

  async findUser(id: string): Promise<User> {
    const { user } = await this.itemsRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    return user;
  }

  async findByUser(userId: string): Promise<Item[]> {
    const items = await this.itemsRepository.find({
      where: { user: { id: userId } },
    });

    return items;
  }

  async itemCountByUser(user: User): Promise<number> {
    return this.itemsRepository.count({ where: { user: { id: user.id } } });
  }
}
