import {
  Controller,
  Post,
  Res,
  HttpStatus,
  HttpException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from './excel.service';

@Controller('api/v1/excel')
export class ExcelController {
  constructor(private readonly excelTcService: ExcelService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Используйте FileInterceptor для обработки загрузки
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ): Promise<void> {
    try {
      if (!file) {
        throw new HttpException('Файл не найден', HttpStatus.BAD_REQUEST);
      }

      // Передаем буфер в сервис для обработки
      const archiveBuffer = await this.excelTcService.excelTc(file.buffer);

      // Устанавливаем заголовки и отправляем архив в ответе
      res.setHeader('Content-Disposition', 'attachment; filename=archive.zip');
      res.setHeader('Content-Type', 'application/zip');
      res.send(archiveBuffer);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
