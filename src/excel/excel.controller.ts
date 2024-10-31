import {
  Controller,
  Post,
  Res,
  HttpStatus,
  HttpException,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from './excel.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ActiveGuard } from '../auth/guards/active.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { IsActive } from '../auth/decorators/activeUser.decorator';

@Controller('api/v1/excel')
export class ExcelController {
  constructor(private readonly excelTcService: ExcelService) {}

  @Post('upload')
  @Roles('admin') // Укажите роль, которая имеет доступ
  @IsActive() // Проверка активности пользователя
  @UseGuards(JwtAuthGuard, ActiveGuard, RolesGuard) // Применение всех гвардов
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
