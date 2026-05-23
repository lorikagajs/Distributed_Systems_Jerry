import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startedAt = Date.now();

    res.on('finish', () => {
      const responseTime = Date.now() - startedAt;
      const url = req.originalUrl || req.url;

      this.logger.log(
        `${req.method} ${url} ${res.statusCode} ${responseTime}ms`,
      );
    });

    next();
  }
}
