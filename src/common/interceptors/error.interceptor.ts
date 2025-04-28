import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        // Tratamento específico para erros do Prisma
        if (error instanceof PrismaClientKnownRequestError) {
          switch (error.code) {
            case 'P2002': // Unique constraint failed
              const target = error.meta?.target as string[];
              const field = target ? target.join(', ') : 'campo único';
              return throwError(
                () =>
                  new HttpException(
                    `Violação de unicidade no campo ${field}`,
                    400,
                  ),
              );

            case 'P2025': // Record not found
              return throwError(
                () => new HttpException('Registro não encontrado', 404),
              );

            default:
              this.logger.error(`Erro do Prisma: ${error.code}`, error.stack);
              return throwError(
                () => new HttpException('Erro no banco de dados', 500),
              );
          }
        }

        // Log do erro não tratado
        this.logger.error('Erro não tratado', error.stack);
        return throwError(
          () =>
            new InternalServerErrorException(
              'Ocorreu um erro interno no servidor',
            ),
        );
      }),
    );
  }
}
