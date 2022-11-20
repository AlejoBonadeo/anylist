import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { SignInInput } from './sign-in.input';

@InputType()
export class SignUpInput extends PartialType(SignInInput) {
  @Field(() => String)
  @IsNotEmpty()
  fullName: string;

}
