import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { HealthResponseDto } from '../dtos/health-response.dto';

import { getErrorMessage } from '@/common/utils/error.util';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Returns the current health status of the API including uptime,
   * memory usage, environment, version, and database connectivity.
   *
   * Throws ServiceUnavailableException (HTTP 503) when the database
   * is unreachable, embedding the diagnostic payload in the response.
   */
  async execute(): Promise<HealthResponseDto> {
    const timestamp = new Date().toISOString();
    const uptime = this.formatUptime(process.uptime());
    const environment = this.config.get<string>('NODE_ENV', 'development');
    const version = this.resolveVersion();
    const mem = process.memoryUsage();
    const memory = {
      heapUsed: this.formatBytes(mem.heapUsed),
      heapTotal: this.formatBytes(mem.heapTotal),
      rss: this.formatBytes(mem.rss),
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      const message = getErrorMessage(error);
      this.logger.error(`Database health check failed: ${message}`);

      throw new ServiceUnavailableException({
        status: 'error',
        timestamp,
        uptime,
        environment,
        version,
        memory,
        database: {
          status: 'error',
          type: 'postgresql',
          error: message,
        },
      });
    }

    this.logger.log('Health check performed');

    return {
      status: 'ok',
      timestamp,
      uptime,
      environment,
      version,
      memory,
      database: { status: 'ok', type: 'postgresql' },
    };
  }

  private resolveVersion(): string {
    const fromEnv = process.env.npm_package_version;

    if (fromEnv && fromEnv.trim().length > 0) {
      return fromEnv;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pkg = require('../../../../package.json') as { version?: string };

      return pkg.version ?? '0.0.0';
    } catch {
      return '0.0.0';
    }
  }

  private formatUptime(seconds: number): string {
    const safe = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const secs = safe % 60;

    return `${hours}h ${minutes}m ${secs}s`;
  }

  private formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) {
      return '0.00 B';
    }

    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }

    return `${bytes.toFixed(2)} B`;
  }
}
