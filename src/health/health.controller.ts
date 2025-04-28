import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return {
            database: {
              status: 'up',
            },
          };
        } catch (error) {
          return {
            database: {
              status: 'down',
              message: error.message,
            },
          };
        }
      },
      async (): Promise<HealthIndicatorResult> => {
        return {
          api: {
            status: 'up',
            version: this.config.get<string>('APP_VERSION', '1.0.0'),
            environment: this.config.get<string>('NODE_ENV', 'development'),
          },
        };
      },
    ]);
  }
}
