import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ErrorInterceptor } from './common/interceptors/error.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configurar ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configurar interceptor de erros global
  app.useGlobalInterceptors(new ErrorInterceptor());

  // Configurar CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configurar prefixo global da API
  app.setGlobalPrefix('api');

  // Iniciar servidor
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  logger.log(`Aplicação inicializada com sucesso na porta ${port}`);
}
bootstrap().catch((err) => {
  Logger.error(
    `Erro ao inicializar a aplicação: ${err.message}`,
    err.stack,
    'Bootstrap',
  );
  process.exit(1);
});
