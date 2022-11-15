import { Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(,{name: 'signUp'})
  signUp() {
    return this.authService.signUp
  }

}
