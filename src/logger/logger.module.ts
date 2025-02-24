import { Module, Global } from '@nestjs/common';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { LoggerService } from './logger.service';

@Global()
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
        new DailyRotateFile({
          dirname: 'logs', // Папка для логов
          filename: 'combined-%DATE%.log', // Имя файла с датой
          datePattern: 'YYYY-MM-DD', // Формат даты
          zippedArchive: true, // Опционально: архивировать старые логи
          maxSize: '20m', // Максимальный размер файла
          maxFiles: '14d', // Хранить логи за последние 14 дней
          level: 'info',
          format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), winston.format.json()),
        }),
        new DailyRotateFile({
          dirname: 'logs',
          filename: 'errors-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',
          format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), winston.format.json()),
        }),
      ],
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService, WinstonModule],
})
export class LoggerModule {}
