import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    // Se não houver roles definidos no decorator, permitir acesso
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Usuário deve ter propriedade 'roles' (para futura implementação)
    if (!user || !user.roles) {
      throw new ForbiddenException(
        'Usuário não tem permissão para acessar este recurso',
      );
    }

    // Verificar se o usuário tem pelo menos uma das roles necessárias
    const hasRole = () => roles.some((role) => user.roles.includes(role));

    if (!hasRole()) {
      throw new ForbiddenException(
        'Usuário não tem permissão para acessar este recurso',
      );
    }

    return true;
  }
}
