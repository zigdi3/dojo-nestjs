import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Se nenhuma propriedade específica for solicitada, retorne o usuário inteiro
    if (!data) {
      return user;
    }

    // Retorna apenas a propriedade solicitada
    return user && user[data];
  },
);
