import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { ArrayNotEmpty, IsArray, IsBoolean, IsOptional, IsUUID, MinLength } from 'class-validator';
import { SignUpInput } from '../../auth/dto/sign-up.input';
import { ValidRoles } from '../../auth/types/valid-roles.enum';

@InputType()
export class UpdateUserInput extends PartialType(SignUpInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => [ValidRoles], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  roles?: ValidRoles[];

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
