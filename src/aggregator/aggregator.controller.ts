// Nest
import { Controller, Get, Req, Query, NotFoundException } from '@nestjs/common';
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
import { LoggerService } from 'src/logger/logger.service';

@ApiTags('Aggregator')
@Controller('api/v1/aggregator')
export class AggregatorController {
  constructor(
    private readonly aggregatorService: AggregatorService,
    private readonly logger: LoggerService,
  ) {}
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
    const startTime = Date.now();

    try {
      const result = await this.aggregatorService.getTariff(query.id);

      if (!result) {
        throw new NotFoundException(`Тариф не найден. ID: ${query.id}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Ошибка в получении тарифаю. ID: ${query.id}`, 'TariffService/getTariff', error.message, {
        id: query.id,
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
      throw error;
    } finally {
      this.logger.log(`Получение тарифа. ID: ${query.id}`, 'TariffService/getTariff', {
        id: query.id,
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
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
    const startTime = Date.now(); // Время начала выполнения
    const { address, providers } = query;

    try {
      const result = await this.aggregatorService.getTariffsOnAddressByAddress(address, providers);

      if (!result.length) {
        this.logger.error(`Тарифов по адресу не найдено. Address: ${address}`, 'AggregatorController/getTariffsOnAddress', 'Тарифов по адресу не найдено', {
          ip: clientIp,
          time: `${Date.now() - startTime} мс`,
        });
        throw new NotFoundException(`Тарифов по адресу не найдено. ADDRESS: ${address}`);
      }

      this.logger.log(`Тарифов по адресу найдены. ADDRESS: ${address}`, 'aggregatorController/getTariffsOnAddress', {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });

      return result;
    } catch (error) {
      this.logger.error(`Ошибка в получении тарифов по адресу. Address: ${address}`, 'aggregatorController/getTariffsOnAddress', error.message, {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
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
    const startTime = Date.now();
    const { hash, providers } = query;

    try {
      const result = await this.aggregatorService.getTariffsOnAddressByHash(hash, providers);

      if (!result.length) {
        this.logger.error(`Тарифов по хэш-адресу не найдено. Address: ${hash}`, 'AggregatorController/getTariffsOnHashAddress', 'Тарифов по хэш-адресу не найдено', {
          ip: clientIp,
          time: `${Date.now() - startTime} мс`,
        });
        throw new NotFoundException(`Тарифов по хэш-адресу не найдено. HASH: ${hash}`);
      }

      this.logger.log(`Тарифы по хэш-адресу найдены. HASH: ${hash}`, 'AggregatorController/getTariffsOnHashAddress', {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });

      return result;
    } catch (error) {
      this.logger.error(`Тарифов по хэш-адресу не найдено. HASH: ${hash}`, 'AggregatorController/getTariffsOnHashAddress', error.message, {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
      throw error;
    }
  }

  @Get('/get/tariffs/onDistrict')
  @ApiOperation({ summary: 'Получение тарифов по населенному пункту' })
  async getTariffsOnDistrict(@Query() query: GetTariffsOnDistrictValidation, @Req() request: Request): Promise<Tariff[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const startTime = Date.now();
    const { district } = query;

    try {
      const result = await this.aggregatorService.getTariffsOnDistrict(district);

      if (!result.length) {
        this.logger.error(
          `Тарифов по населенному пункту не найдено. DISTRICT: ${district}`,
          'AggregatorController/getTariffsOnDistrict',
          'Тарифов по населенному пункту не найдено',
          {
            ip: clientIp,
            time: `${Date.now() - startTime} мс`,
          },
        );
        throw new NotFoundException(`Тарифов по населенному пункту не найдено. DISTRICT: ${district}`);
      }

      this.logger.log(`Тарифов по населенному пункту найдены. DISTRICT: ${district}`, 'AggregatorController/getTariffsOnDistrict', {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });

      return result;
    } catch (error) {
      this.logger.error(`Ошибка в получении тарифов по населенному пункту. DISTRICT: ${district}`, 'AggregatorController/getTariffsOnDistrict', error.message, {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
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
    const startTime = Date.now();

    try {
      const result = await this.aggregatorService.getAllTariffsIds();

      if (!result.length) {
        this.logger.error(`Айди тарифов не найдены. `, 'AggregatorController/getAllTariffsIds', 'Айди тарифов не найдены', {
          ip: clientIp,
          time: `${Date.now() - startTime} мс`,
        });
      }
      this.logger.log(`Айди тарифов найдены.`, 'AggregatorController/getAllTariffsIds', { ip: clientIp, time: `${Date.now() - startTime} мс` });

      return result;
    } catch (error) {
      this.logger.error(`Ошибка в получении айди тарифов.`, 'AggregatorController/getAllTariffsIds', error.message, {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
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
    const startTime = Date.now();
    const { address, providers } = query;

    try {
      const result = await this.aggregatorService.getProvidersOnAddressByAddress(address, providers);

      if (!result.length) {
        this.logger.error(`Провайдеры по адресу не найдены. ADDRESS: ${address}`, 'AggregatorController/getProvidersOnAddress', 'Провайдеры по адресу не найдены', {
          ip: clientIp,
          time: `${Date.now() - startTime} мс`,
        });
        throw new NotFoundException(`No providers. ADDRESS: ${address}`);
      }

      this.logger.log(`Провайдеры по адресу найдены. ADDRESS: ${address}`, 'AggregatorController/getProvidersOnAddress', {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });

      return result;
    } catch (error) {
      this.logger.error(`Ошибка в получении провайдеров по адресу не найдены. ADDRESS: ${address}`, 'AggregatorController/getProvidersOnAddress', error.message, {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
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
    const startTime = Date.now();
    const { hashAddress, providers } = query;

    try {
      const result = await this.aggregatorService.getProvidersOnAddressByHash(hashAddress, providers);

      if (!result.length) {
        this.logger.error(
          `Провайдеры по хэш адресу не найдены. HASH: ${hashAddress}`,
          'AggregatorController/getProvidersOnHashAddress',
          'Провайдеры по хэш адресу не найдены',
          { ip: clientIp, time: `${Date.now() - startTime} мс` },
        );
        throw new NotFoundException(`Провайдеры по хэш адресу не найдены. HASH: ${hashAddress}`);
      }
      this.logger.log(`Провайдеры по хэш адресу найдены. HASH: ${hashAddress}`, 'AggregatorController/getProvidersOnHashAddress', {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });

      return result;
    } catch (error) {
      this.logger.error(`Ошибка в получении провайдеров по хэщ адресу. HASH: ${hashAddress}`, 'AggregatorController/getProvidersOnHashAddress', error.message, {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
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
    const startTime = Date.now();
    const { district } = query;

    try {
      const result = await this.aggregatorService.getProvidersOnDistrict(district);

      if (!result.length) {
        this.logger.error(
          `Провайдеры по населенному пункту не найдены. DISTRICT: ${district}`,
          ' AggregatorController/getProvidersOnDistrict',
          'Провайдеры по населенному пункту не найдены',
          {
            ip: clientIp,
            time: `${Date.now() - startTime} мс`,
          },
        );
        throw new NotFoundException(`No providers. DISTRICT: ${district}`);
      }

      this.logger.log(`Провайдеры по населенному пункту найдены. DISTRICT: ${district}`, 'AggregatorController/getProvidersOnDistrict', {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });

      return result;
    } catch (error) {
      this.logger.error(`Ошибка в получении провайдеров по населенному пункту. DISTRICT: ${district}`, 'AggregatorController/getProvidersOnDistrict', error.message, {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
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
    const startTime = Date.now();

    try {
      const result = await this.aggregatorService.getAllDistricts();

      if (!result.length) {
        this.logger.error(`Населенные пункты не найдены.`, 'AggregatorController/getAllDistricts', 'Населенные пункты не найдены', {
          ip: clientIp,
          time: `${Date.now() - startTime} мс`,
        });
      }
      this.logger.log(`Населенные пункты найдены.`, 'AggregatorController/getAllDistricts', { ip: clientIp, time: `${Date.now() - startTime} мс` });

      return result;
    } catch (error) {
      this.logger.error(`Ошибка в получении населенных пунктов.`, 'AggregatorController/getAllDistricts', error.message, {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
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
    const startTime = Date.now();

    try {
      const result = await this.aggregatorService.getDistrictByIP(clientIp);

      this.logger.log(`Населенный пункт найден. IP: ${clientIp} DISTRICT: ${result}`, 'AggregatorController/getDistrictOnIP', {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
      return result;
    } catch (error) {
      this.logger.error(`Ошибка в получении населенного пункта по ip. IP: ${clientIp}`, 'AggregatorController/getDistrictOnIP', error.message, {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
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
    const startTime = Date.now();
    const { district } = query;

    try {
      const result = await this.aggregatorService.getInfoDistrictByEngName(district);
      if (!result) {
        this.logger.error(
          `Информация о населенном пункте не найдена. DISTRICT: ${district}`,
          'AggregatorController/getDistrictInfo',
          'Информация о населенном пункте не найдена',
          {
            ip: clientIp,
            time: `${Date.now() - startTime} мс`,
          },
        );
      }

      this.logger.log(`Информация о населенном пункте найдена. DISTRICT: ${district}`, 'AggregatorController/getDistrictInfo', {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });

      return result;
    } catch (error) {
      this.logger.error(`Ошибка в получении информации о населенном пункте. DISTRICT: ${district}`, 'AggregatorController/getDistrictInfo', error.message, {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
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
    const startTime = Date.now();
    const { fiasID } = query;

    try {
      const result = await this.aggregatorService.getDistrictEngNameByFiasID(fiasID);

      if (!result) {
        this.logger.error(
          `Наименование населенного пункта не найдено. FIASID: ${fiasID}`,
          'AggregatorController/getDistrictEngNameByFiasID',
          'Наименование населенного пункта не найдено',
          { ip: clientIp, time: `${Date.now() - startTime} мс` },
        );
      }
      this.logger.log(`Наименование населенного пункта найдено. FIASID: ${fiasID}`, 'AggregatorController/getDistrictEngNameByFiasID', {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });

      return result;
    } catch (error) {
      this.logger.error(`Ошибка в получении наименования населенного пункта. FIASID: ${fiasID}`, 'AggregatorController/getDistrictEngNameByFiasID', error.message, {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
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
    const startTime = Date.now();
    const { address } = query;

    try {
      const result = await this.aggregatorService.getTarrifsRTKOnAddress(address);

      if (!result) {
        this.logger.error(
          `Тарифы ростелекома по адресу не найдены. ADDRESS: ${address}`,
          'AggregatorController/getTarrifsRTKOnAddress',
          'Тарифы ростелекома по адресу не найдены',
          { ip: clientIp, time: `${Date.now() - startTime} мс` },
        );
      }

      this.logger.log(`Тарифы ростелекома по адресу найдены. ADDRESS: ${address}`, 'AggregatorController/getTarrifsRTKOnAddress', {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });

      return result;
    } catch (error) {
      this.logger.error(`Ошибка в получении тарифов ростелекома по адресу. ADDRESS: ${address}`, 'AggregatorController/getTarrifsRTKOnAddress', error.message, {
        ip: clientIp,
        time: `${Date.now() - startTime} мс`,
      });
      throw error;
    }
  }
}
