import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { ValidRoles } from '../types/valid-roles.enum';

export const CurrentUser = createParamDecorator(
  (roles: ValidRoles[] = [], context: ExecutionContext): User => {
    const ctx = GqlExecutionContext.create(context);
    const user: User = ctx.getContext().req.user;

    if (!user) {
        throw new InternalServerErrorException('Use JwtAuthGuard');
    }
    if(!roles.length) return user;

    if(user.roles.some(role => roles.includes(role as ValidRoles))) {
      return user;
    }

    throw new ForbiddenException(`User ${user.fullName} needs validRole: [${roles.join(', ')}]`)
  },
);
