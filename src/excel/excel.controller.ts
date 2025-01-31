import { Controller, Post, Body, Res, Req, Logger, HttpStatus, HttpException, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
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
  private readonly logger = new Logger(ExcelController.name);
  constructor(private readonly excelService: ExcelService) {}

  @ApiOperation({ summary: 'Загрузка Excel-файла для полученея ТХВ по адресам. ' })
  @ApiOkResponse({ description: 'Excel-файл успешно загружен' })
  @ApiNotFoundResponse({ description: 'Файл не найден' })
  @Post('upload')
  @Roles('admin') // Укажите роль, которая имеет доступ
  @IsActive() // Проверка активности пользователя
  @UseGuards(JwtAuthGuard, ActiveGuard, RolesGuard) // Применение всех гвардов
  @UseInterceptors(FileInterceptor('file')) // Используйте FileInterceptor для обработки загрузки
  async uploadExcel(@UploadedFile() file: Express.Multer.File, @Res() res: Response, @Req() request: Request): Promise<void> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();

    try {
      if (!file) {
        this.logger.error(`Файл не найден`, { ip: clientIp, path: requestPath, time: `${Date.now() - startTime} мс` });
        throw new HttpException('Файл не найден', HttpStatus.BAD_REQUEST);
      }

      // Передаем буфер в сервис для обработки
      const archiveBuffer = await this.excelService.excelTc(file.buffer);

      // Устанавливаем заголовки и отправляем архив в ответе
      res.setHeader('Content-Disposition', 'attachment; filename=archive.zip');
      res.setHeader('Content-Type', 'application/zip');
      res.send(archiveBuffer);

      this.logger.log(`Excel-файл успешно загружен`, { ip: clientIp, path: requestPath, time: `${Date.now() - startTime} мс` });
    } catch (error) {
      this.logger.error(`Ошибка при загрузке Excel-файла`, { ip: clientIp, path: requestPath, time: `${Date.now() - startTime} мс`, error: error.message });
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
  async eissdLeads(@UploadedFile() file: Express.Multer.File, @Res() res: Response, @Req() request: Request): Promise<void> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();

    try {
      if (!file) {
        this.logger.error(`Файл не найден`, { ip: clientIp, path: requestPath, time: `${Date.now() - startTime} мс` });
        throw new HttpException('Файл не найден', HttpStatus.BAD_REQUEST);
      }

      // Передаем буфер в сервис для обработки
      const archiveBuffer = await this.excelService.excelSendLeadsEissd(file.buffer);

      // Устанавливаем заголовки для скачивания файла
      res.setHeader('Content-Disposition', 'attachment; filename=partner_leads.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(archiveBuffer);

      this.logger.log(`Excel-файл успешно загружен`, { ip: clientIp, path: requestPath, time: `${Date.now() - startTime} мс` });
    } catch (error) {
      this.logger.error(`Ошибка при загрузке Excel-файла`, { ip: clientIp, path: requestPath, time: `${Date.now() - startTime} мс`, error: error.message });
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
  async partnerLeads(@Body() body: PartnerLeadsValidation, @Res() res: Response, @Req() request: Request): Promise<void> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();

    try {
      // Получаем буфер с Excel-файлом
      const excelBuffer = await this.excelService.excelPartnerLeads(body.partnerId, body.startDate, body.endDate);

      // Устанавливаем заголовки для скачивания файла
      res.setHeader('Content-Disposition', 'attachment; filename=partner_leads.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      this.logger.log(`Excel-файл успешно выгружен`, { ip: clientIp, path: requestPath, time: `${Date.now() - startTime} мс` });
      // Отправляем буфер как ответ
      res.status(200).send(excelBuffer);
    } catch (error) {
      this.logger.error(`Ошибка при выгрузке Excel-файла`, { ip: clientIp, path: requestPath, time: `${Date.now() - startTime} мс`, error: error.message });
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
