import { Controller, Post, Body, Res, HttpStatus, HttpException, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from './excel.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ActiveGuard } from '../auth/guards/active.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { IsActive } from '../auth/decorators/activeUser.decorator';
import { PartnerLeadsValidation } from './validations/partnerLeads.validation';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Excel')
@Controller('api/v1/excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @ApiOperation({ summary: 'Загрузка Excel-файла для полученея ТХВ по адресам. ' })
  @ApiOkResponse({ description: 'Excel-файл успешно загружен' })
  @ApiNotFoundResponse({ description: 'Файл не найден' })
  @Post('upload')
  @Roles('admin') // Укажите роль, которая имеет доступ
  @IsActive() // Проверка активности пользователя
  @UseGuards(JwtAuthGuard, ActiveGuard, RolesGuard) // Применение всех гвардов
  @UseInterceptors(FileInterceptor('file')) // Используйте FileInterceptor для обработки загрузки
  async uploadExcel(@UploadedFile() file: Express.Multer.File, @Res() res: Response): Promise<void> {
    try {
      if (!file) {
        throw new HttpException('Файл не найден', HttpStatus.BAD_REQUEST);
      }

      // Передаем буфер в сервис для обработки
      const archiveBuffer = await this.excelService.excelTc(file.buffer);

      // Устанавливаем заголовки и отправляем архив в ответе
      res.setHeader('Content-Disposition', 'attachment; filename=archive.zip');
      res.setHeader('Content-Type', 'application/zip');
      res.send(archiveBuffer);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Загрузка Excel-файла для заведения заявок через eissd.' })
  @ApiOkResponse({ description: 'Excel-файл успешно загружен' })
  @ApiNotFoundResponse({ description: 'Файл не найден' })
  @Post('leadsEissd')
  @Roles('admin')
  @IsActive()
  @UseGuards(JwtAuthGuard, ActiveGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  async eissdLeads(@UploadedFile() file: Express.Multer.File, @Res() res: Response): Promise<void> {
    try {
      if (!file) {
        throw new HttpException('Файл не найден', HttpStatus.BAD_REQUEST);
      }

      // Передаем буфер в сервис для обработки
      const archiveBuffer = await this.excelService.excelSendLeadsEissd(file.buffer);

      // Устанавливаем заголовки для скачивания файла
      res.setHeader('Content-Disposition', 'attachment; filename=partner_leads.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(archiveBuffer);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Получение отчета по заявкам от партнеров' })
  @ApiOkResponse({ description: 'Excel-файл успешно загружен' })
  @ApiNotFoundResponse({ description: 'Файл не найден' })
  @Post('partnerLeads')
  @Roles('admin') // Укажите роль, которая имеет доступ
  @IsActive() // Проверка активности пользователя
  @UseGuards(JwtAuthGuard, ActiveGuard, RolesGuard) // Применение всех гвардов
  async partnerLeads(@Body() body: PartnerLeadsValidation, @Res() res: Response) {
    try {
      // Получаем буфер с Excel-файлом
      const excelBuffer = await this.excelService.excelPartnerLeads(body.partnerId, body.startDate, body.endDate);

      // Устанавливаем заголовки для скачивания файла
      res.setHeader('Content-Disposition', 'attachment; filename=partner_leads.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // Отправляем буфер как ответ
      res.status(200).send(excelBuffer);
    } catch (error) {
      console.error('Error generating Excel:', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
