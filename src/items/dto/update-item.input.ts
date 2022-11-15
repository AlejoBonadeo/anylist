import { CreateItemInput } from './create-item.input';
import { InputType, Field, Int, PartialType, ID, Float } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateItemInput extends PartialType(CreateItemInput) {
  @Field(() => ID)
  @IsUUID()
  @IsString()
  id: string;
}
