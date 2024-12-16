// Nest
import { Controller, Get, Req, Query, NotFoundException, Logger } from '@nestjs/common';
import { Request } from 'express';
// Services
import { AggregatorService } from './aggregator.service';
// Entities
import { Tariff } from '../db1/entities/tariff.entity';
import { Provider } from '../db1/entities/provider.entity';
// Validations
import {
  GetTariffValidation,
  GetTariffsOnAddressValidation,
  GetTariffsOnDistrictValidation,
  GetTariffsOnHashAddressValidation,
} from './validations/tariffs.validations';
import { GetProvidersOnAddressValidation, GetProvidersOnDistrictValidation, GetProvidersOnHashAddressValidation } from './validations/providers.validations';
import { GetDistrictInfoValidation, GetDistrictEngNameByFiasIDValidation } from './validations/districts.validations';
import { GetTarrifsRTKOnAddressValidation } from './validations/rtk.validations';
//swagger
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TariffDTO, NoTariffDTO, NoTariffsDTO } from './dtos/tariff.dto';
import { ProviderDTO, NoProvidersDTO } from './dtos/provider.dto';
import { DistrictInfoDTO, NoDistrictsDTO, NoDistrictDTO } from './dtos/district.dto';

@ApiTags('Aggregator')
@Controller('api/v1/aggregator')
export class AggregatorController {
  private readonly logger = new Logger(AggregatorController.name);

  constructor(private readonly aggregatorService: AggregatorService) {}

  // Утилиты
  private getIpFromHeaders(request: Request): string {
    return Array.isArray(request.headers['x-client-ip']) ? request.headers['x-client-ip'][0] : (request.headers['x-client-ip'] as string);
  }
  // Работа с тарифами
  @Get('/get/tariff')
  @ApiOperation({ summary: 'Получение тарифа по ID' })
  @ApiOkResponse({ description: 'Успешное получение тарифа', type: TariffDTO })
  @ApiNotFoundResponse({ description: 'Тариф не найден', type: NoTariffDTO })
  async getTariff(@Query() query: GetTariffValidation, @Req() request: Request): Promise<Tariff> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl; // Получаем полный путь запроса
    const startTime = Date.now(); // Запоминаем время начала выполнения

    try {
      const result = await this.aggregatorService.getTariff(query.id);

      if (!result) {
        const endTime = Date.now(); // Запоминаем время завершения выполнения
        const executionTime = endTime - startTime; // Вычисляем время выполнения
        this.logger.error(`Tariff not found. ID: ${query.id} || IP: ${clientIp} || PATH: ${requestPath} || TIME: ${executionTime} мс`);
        throw new NotFoundException(`Тариф не найден. ID: ${query.id}`);
      }

      const endTime = Date.now(); // Запоминаем время завершения выполнения
      const executionTime = endTime - startTime; // Вычисляем время выполнения

      this.logger.log(`Tarriff found. ID: ${query.id} || IP: ${clientIp} PATH: ${requestPath} || TIME: ${executionTime} мс`);
      return result;
    } catch (error) {
      const endTime = Date.now(); // Запоминаем время завершения выполнения в случае ошибки
      const executionTime = endTime - startTime; // Вычисляем время выполнения

      this.logger.error(`Error. ID: ${query.id} || IP: ${clientIp} || PATH: ${requestPath} || TIME: ${executionTime} мс`, error.stack);
      throw error;
    }
  }

  @Get('/get/tariffs/onAddress')
  @ApiOperation({ summary: 'Получение тарифов по адресу' })
  @ApiOkResponse({
    description: 'Успешное получение тарифов',
    type: [TariffDTO],
  })
  @ApiNotFoundResponse({ description: 'Тарифы не найдены', type: NoTariffsDTO })
  async getTariffsOnAddress(@Query() query: GetTariffsOnAddressValidation, @Req() request: Request): Promise<Tariff[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now(); // Время начала выполнения
    const { address, providers } = query;

    try {
      const result = await this.aggregatorService.getTariffsOnAddressByAddress(address, providers);

      if (!result.length) {
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        this.logger.error(`No tariff. ADDRESS: ${address} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);
        throw new NotFoundException(`No tariff. ADDRESS: ${address}`);
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(`Tarriffs found. ADDRESS: ${address} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(`Error. ADDRESS: ${address} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`, error.stack);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Получение тарифов по хэш адресу' })
  @ApiOkResponse({
    description: 'Успешное получение тарифов',
    type: [TariffDTO],
  })
  @ApiNotFoundResponse({ description: 'Тарифы не найдены', type: NoTariffsDTO })
  @Get('/get/tariffs/onHashAddress')
  async getTariffsOnHashAddress(@Query() query: GetTariffsOnHashAddressValidation, @Req() request: Request): Promise<Tariff[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();
    const { hash, providers } = query;

    try {
      const result = await this.aggregatorService.getTariffsOnAddressByHash(hash, providers);

      if (!result.length) {
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        this.logger.error(`No tariff. HASH: ${hash} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);
        throw new NotFoundException(`No tariff. HASH: ${hash}`);
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(`Tarriffs found. HASH: ${hash} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(`Error. HASH: ${hash} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`, error.stack);
      throw error;
    }
  }

  @Get('/get/tariffs/onDistrict')
  @ApiOperation({ summary: 'Получение тарифов по населенному пункту' })
  @ApiOkResponse({
    description: 'Успешное получение тарифов',
    type: [TariffDTO],
  })
  @ApiNotFoundResponse({ description: 'Тарифы не найдены', type: NoTariffsDTO })
  async getTariffsOnDistrict(@Query() query: GetTariffsOnDistrictValidation, @Req() request: Request): Promise<Tariff[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();
    const { district } = query;

    try {
      const result = await this.aggregatorService.getTariffsOnDistrict(district);

      if (!result.length) {
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        this.logger.error(`No tariff. DISTRICT: ${district} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);
        throw new NotFoundException(`No tariff. DISTRICT: ${district}`);
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(`Tarriffs found. DISTRICT: ${district} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(`Error. DISTRICT: ${district} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`, error.stack);
      throw error;
    }
  }

  @Get('/get/tariffsIds')
  @ApiOperation({ summary: 'Получение id всех тарифов' })
  @ApiOkResponse({
    description: 'Успешное получение id всех тарифов',
    type: [Number],
  })
  @ApiNotFoundResponse({ description: 'Тарифы не найдены', type: NoTariffsDTO })
  async getAllTariffsIds(@Req() request: Request): Promise<number[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();

    try {
      const result = await this.aggregatorService.getAllTariffsIds();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(`All id of tariffs found. IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(`Error. IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`, error.stack);
      throw error;
    }
  }

  // Работа с провайдерами
  @Get('/get/providers/onAddress')
  @ApiOperation({ summary: 'Получение провайдеров по адресу' })
  @ApiOkResponse({
    description: 'Успешное получение провайдеров',
    type: [ProviderDTO],
  })
  @ApiNotFoundResponse({
    description: 'Провайдеры не найдены',
    type: NoProvidersDTO,
  })
  async getProvidersOnAddress(@Query() query: GetProvidersOnAddressValidation, @Req() request: Request): Promise<Provider[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();
    const { address, providers } = query;

    try {
      const result = await this.aggregatorService.getProvidersOnAddressByAddress(address, providers);

      if (!result.length) {
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        this.logger.error(`No providers. ADDRESS: ${address} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);
        throw new NotFoundException(`No providers. ADDRESS: ${address}`);
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(`Providers found. ADDRESS: ${address} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(`Error. ADDRESS: ${address} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`, error.stack);
      throw error;
    }
  }
  @Get('/get/providers/onHashAddress')
  @ApiOperation({ summary: 'Получение провайдеров по hash адресу' })
  @ApiOkResponse({
    description: 'Успешное получение провайдеров',
    type: [ProviderDTO],
  })
  @ApiNotFoundResponse({
    description: 'Провайдеры не найдены',
    type: NoProvidersDTO,
  })
  async getProvidersOnHashAddress(@Query() query: GetProvidersOnHashAddressValidation, @Req() request: Request): Promise<Provider[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();
    const { hashAddress, providers } = query;

    try {
      const result = await this.aggregatorService.getProvidersOnAddressByHash(hashAddress, providers);

      if (!result.length) {
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        this.logger.error(`No providers. HASH: ${hashAddress} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);
        throw new NotFoundException(`No providers. HASH: ${hashAddress}`);
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(`Providers found. HASH: ${hashAddress} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(`Error. HASH: ${hashAddress} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`, error.stack);
      throw error;
    }
  }
  @Get('/get/providers/onDistrict')
  @ApiOperation({ summary: 'Получение провайдеров по населенному пункту' })
  @ApiOkResponse({
    description: 'Успешное получение провайдеров',
    type: [ProviderDTO],
  })
  @ApiNotFoundResponse({
    description: 'Провайдеры не найдены',
    type: NoProvidersDTO,
  })
  async getProvidersOnDistrict(@Query() query: GetProvidersOnDistrictValidation, @Req() request: Request): Promise<Provider[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();
    const { district } = query;

    try {
      const result = await this.aggregatorService.getProvidersOnDistrict(district);

      if (!result.length) {
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        this.logger.error(`No providers. DISTRICT: ${district} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);
        throw new NotFoundException(`No providers. DISTRICT: ${district}`);
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(`Providers found. DISTRICT: ${district} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(`Error. DISTRICT: ${district} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`, error.stack);
      throw error;
    }
  }

  // Работа с населенными пунктами
  @Get('/get/allDistricts')
  @ApiOperation({ summary: 'Получение всех населенных пунктов из базы' })
  @ApiOkResponse({
    description: 'Успешное получение населенных пунктов',
    type: [String],
  })
  @ApiNotFoundResponse({
    description: 'Населенные пункты не найдены',
    type: NoDistrictsDTO,
  })
  async getAllDistricts(@Req() request: Request): Promise<string[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();

    try {
      const result = await this.aggregatorService.getAllDistricts();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(`All districts found. IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(`Error. IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`, error.stack);
      throw error;
    }
  }
  @Get('/get/district')
  @ApiOperation({ summary: 'Получение населенного пункта по IP' })
  @ApiOkResponse({
    description: 'Успешное получение населенного пункта',
    type: [String],
  })
  @ApiNotFoundResponse({
    description: 'Населенный пункт не найден',
    type: NoDistrictDTO,
  })
  async getDistrictOnIP(@Req() request: Request): Promise<string[]> {
    const clientIp = request.ip || request.socket.remoteAddress || this.getIpFromHeaders(request);
    const requestPath = request.originalUrl;
    const startTime = Date.now();

    try {
      const result = await this.aggregatorService.getDistrictByIP(clientIp);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(`District found by IP. IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(`Error. IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`, error.stack);
      throw error;
    }
  }
  @Get('/get/districtInfo')
  @ApiOperation({ summary: 'Получение информации о населенном пункте' })
  @ApiOkResponse({
    description: 'Успешное получение информации о населенном пункте',
    type: DistrictInfoDTO,
  })
  @ApiNotFoundResponse({
    description: 'Информация о населенном пункте не найдена',
    type: NoDistrictDTO,
  })
  async getDistrictInfo(@Query() query: GetDistrictInfoValidation, @Req() request: Request): Promise<any> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();
    const { district } = query;

    try {
      const result = await this.aggregatorService.getInfoDistrictByEngName(district);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(`Info found. DISTRICT: ${district} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(`Error. DISTRICT: ${district} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`, error.stack);
      throw error;
    }
  }
  @Get('/get/districtEngName/onFiasID')
  @ApiOperation({
    summary: 'Получение наименования населенного пункта по FiasID',
  })
  @ApiOkResponse({
    description: 'Успешное получение наименования населенного пункта',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Населенный пункт не найден',
    type: NoDistrictDTO,
  })
  async getDistrictEngNameByFiasID(@Query() query: GetDistrictEngNameByFiasIDValidation, @Req() request: Request): Promise<{ engNameDistrict: string }> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();
    const { fiasID } = query;

    try {
      const result = await this.aggregatorService.getDistrictEngNameByFiasID(fiasID);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(`District found by FiasID. FiasID: ${fiasID} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(`Error. FiasID: ${fiasID} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`, error.stack);
      throw error;
    }
  }

  // Работа с ростелекомом
  @Get('/get/tarrifsRTK/onAddress')
  @ApiOperation({ summary: 'Получение тарифов РТК по адресу' })
  @ApiOkResponse({
    description: 'Успешное получение тарифов РТК по адресу',
    type: [Tariff],
  })
  @ApiNotFoundResponse({
    description: 'Тарифы РТК не найдены',
    type: NoTariffsDTO,
  })
  async getTarrifsRTKOnAddress(@Query() query: GetTarrifsRTKOnAddressValidation, @Req() request: Request): Promise<Tariff[] | boolean> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();
    const { address } = query;

    try {
      const result = await this.aggregatorService.getTarrifsRTKOnAddress(address);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(`Tarriffs rtk found. ADDRESS: ${address} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`);

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(`Error. ADDRESS: ${address} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`, error.stack);
      throw error;
    }
  }
}
