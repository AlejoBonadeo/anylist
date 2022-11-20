import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SignInInput, SignUpInput } from './dto';
import { AuthResponse } from './types/auth-response.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpInput: SignUpInput): Promise<AuthResponse> {
    const user = await this.usersService.create(signUpInput);

    const token = this.getJwt(user.id);

    return { token, user };
  }

  async signIn({ email, password }: SignInInput): Promise<AuthResponse> {
    const user = await this.usersService.findOneByEmail(email);

    if (!compareSync(password, user.password)) {
      throw new BadRequestException('Incorrect email or password');
    }

    const token = this.getJwt(user.id);

    return { token, user };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);

    if (!user.isActive) {
      throw new ForbiddenException('User is inactive');
    }

    delete user.password;

    return user;
  }

  revalidateToken(user: User): AuthResponse {
    const token = this.getJwt(user.id)
    return { token, user }
  }

  private getJwt(userId: string) {
    return this.jwtService.sign({ id: userId });
  }
}
