import { Module, Global } from '@nestjs/common';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { LoggerService } from './logger.service';

@Global() // Делаем модуль глобальным, чтобы его можно было использовать в любом месте приложения
@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `${timestamp} [${level}] ${context ? `[${context}] ` : ''}${message}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          level: 'info',
          format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), winston.format.json()),
        }),
        new winston.transports.File({
          filename: 'logs/errors.log',
          level: 'error',
          format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), winston.format.json()),
        }),
      ],
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService, WinstonModule], // Экспортируем, чтобы использовать в других модулях
})
export class LoggerModule {}
