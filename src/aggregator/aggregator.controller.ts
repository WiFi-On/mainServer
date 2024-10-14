import {
  Controller,
  Get,
  Req,
  Query,
  NotFoundException,
  Logger,
} from '@nestjs/common';

import { Request } from 'express';

import { AggregatorService } from './aggregator.service';

import { Tariff } from './entities/tariff.entity';
import { Provider } from './entities/provider.entity';

import {
  GetTariffDto,
  GetTariffsOnAddressDto,
  GetTariffsOnDistrictDto,
  GetTariffsOnHashAddressDto,
} from './dtos/tariffs.dtos';
import {
  GetProvidersOnAddressDto,
  GetProvidersOnDistrictDto,
  GetProvidersOnHashAddressDto,
} from './dtos/providers.dtos';
import {
  GetDistrictInfoDto,
  GetDistrictEngNameByFiasIDDto,
} from './dtos/districts.dtos';
import { GetTarrifsRTKOnAddressDto } from './dtos/rtk.dtos';

@Controller('api/v1/aggregator')
export class AggregatorController {
  private readonly logger = new Logger(AggregatorController.name);

  constructor(private readonly aggregatorService: AggregatorService) {}

  // Работа с тарифами
  @Get('/get/tariff')
  async getTariff(
    @Query() query: GetTariffDto,
    @Req() request: Request,
  ): Promise<Tariff> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl; // Получаем полный путь запроса
    const startTime = Date.now(); // Запоминаем время начала выполнения

    try {
      const result = await this.aggregatorService.getTariff(query.id);

      if (!result) {
        const endTime = Date.now(); // Запоминаем время завершения выполнения
        const executionTime = endTime - startTime; // Вычисляем время выполнения
        throw new NotFoundException(
          `Tariff not found. ID: ${query.id} || IP: ${clientIp} || PATH: ${requestPath} || TIME: ${executionTime} мс`,
        );
      }

      const endTime = Date.now(); // Запоминаем время завершения выполнения
      const executionTime = endTime - startTime; // Вычисляем время выполнения

      this.logger.log(
        `Tarriffs found. ID: ${query.id} || IP: ${clientIp} PATH: ${requestPath} || TIME: ${executionTime} мс`,
      );
      return result;
    } catch (error) {
      const endTime = Date.now(); // Запоминаем время завершения выполнения в случае ошибки
      const executionTime = endTime - startTime; // Вычисляем время выполнения

      this.logger.error(
        `Error. ID: ${query.id} || IP: ${clientIp} || PATH: ${requestPath} || TIME: ${executionTime} мс`,
        error.stack,
      );
      throw error;
    }
  }
  @Get('/get/tariffs/onAddress')
  async getTariffsOnAddress(
    @Query() query: GetTariffsOnAddressDto,
    @Req() request: Request,
  ): Promise<Tariff[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now(); // Время начала выполнения
    const { address, providers } = query;

    try {
      const result = await this.aggregatorService.getTariffsOnAddressByAddress(
        address,
        providers,
      );

      if (!result.length) {
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        throw new NotFoundException(
          `No tariff. ADDRESS: ${address} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        );
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(
        `Tarriffs found. ADDRESS: ${address} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
      );

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(
        `Error. ADDRESS: ${address} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        error.stack,
      );
      throw error;
    }
  }
  @Get('/get/tariffs/onHashAddress')
  async getTariffsOnHashAddress(
    @Query() query: GetTariffsOnHashAddressDto,
    @Req() request: Request,
  ): Promise<Tariff[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();
    const { hash, providers } = query;

    try {
      const result = await this.aggregatorService.getTariffsOnAddressByHash(
        hash,
        providers,
      );

      if (!result.length) {
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        throw new NotFoundException(
          `No tariff. HASH: ${hash} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        );
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(
        `Tarriffs found. HASH: ${hash} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
      );

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(
        `Error. HASH: ${hash} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        error.stack,
      );
      throw error;
    }
  }
  @Get('/get/tariffs/onDistrict')
  async getTariffsOnDistrict(
    @Query() query: GetTariffsOnDistrictDto,
    @Req() request: Request,
  ): Promise<Tariff[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();
    const { district } = query;

    try {
      const result =
        await this.aggregatorService.getTariffsOnDistrict(district);

      if (!result.length) {
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        throw new NotFoundException(
          `No tariff. DISTRICT: ${district} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        );
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(
        `Tarriffs found. DISTRICT: ${district} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
      );

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(
        `Error. DISTRICT: ${district} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        error.stack,
      );
      throw error;
    }
  }

  // Работа с провайдерами
  @Get('/get/providers/onAddress')
  async getProvidersOnAddress(
    @Query() query: GetProvidersOnAddressDto,
    @Req() request: Request,
  ): Promise<Provider[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();
    const { address, providers } = query;

    try {
      const result =
        await this.aggregatorService.getProvidersOnAddressByAddress(
          address,
          providers,
        );

      if (!result.length) {
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        throw new NotFoundException(
          `No providers. ADDRESS: ${address} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        );
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(
        `Providers found. ADDRESS: ${address} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
      );

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(
        `Error. ADDRESS: ${address} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        error.stack,
      );
      throw error;
    }
  }
  @Get('/get/providers/onHashAddress')
  async getProvidersOnHashAddress(
    @Query() query: GetProvidersOnHashAddressDto,
    @Req() request: Request,
  ): Promise<Provider[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();
    const { hashAddress, providers } = query;

    try {
      const result = await this.aggregatorService.getProvidersOnAddressByHash(
        hashAddress,
        providers,
      );

      if (!result.length) {
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        throw new NotFoundException(
          `No providers. HASH: ${hashAddress} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        );
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(
        `Providers found. HASH: ${hashAddress} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
      );

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(
        `Error. HASH: ${hashAddress} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        error.stack,
      );
      throw error;
    }
  }
  @Get('/get/providers/onDistrict')
  async getProvidersOnDistrict(
    @Query() query: GetProvidersOnDistrictDto,
    @Req() request: Request,
  ): Promise<Provider[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();
    const { district } = query;

    try {
      const result =
        await this.aggregatorService.getProvidersOnDistrict(district);

      if (!result.length) {
        const endTime = Date.now();
        const executionTime = endTime - startTime;

        throw new NotFoundException(
          `No providers. DISTRICT: ${district} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        );
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(
        `Providers found. DISTRICT: ${district} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
      );

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(
        `Error. DISTRICT: ${district} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        error.stack,
      );
      throw error;
    }
  }

  // Работа с населенными пунктами
  @Get('/get/allDistricts')
  async getAllDistricts(@Req() request: Request): Promise<string[]> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();

    try {
      const result = await this.aggregatorService.getAllDistricts();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(
        `All districts found. IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
      );

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(
        `Error. IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        error.stack,
      );
      throw error;
    }
  }
  private getIpFromHeaders(request: Request): string {
    return Array.isArray(request.headers['x-forwarded-for'])
      ? request.headers['x-forwarded-for'][0]
      : (request.headers['x-forwarded-for'] as string);
  }
  @Get('/get/district')
  async getDistrictOnIP(@Req() request: Request): Promise<string[]> {
    const clientIp =
      request.ip ||
      request.socket.remoteAddress ||
      this.getIpFromHeaders(request);
    const requestPath = request.originalUrl;
    const startTime = Date.now();

    try {
      const result = await this.aggregatorService.getDistrictByIP(clientIp);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(
        `District found by IP. IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
      );

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(
        `Error. IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        error.stack,
      );
      throw error;
    }
  }
  @Get('/get/districtInfo')
  async getDistrictInfo(
    @Query() query: GetDistrictInfoDto,
    @Req() request: Request,
  ): Promise<any> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();
    const { district } = query;

    try {
      const result =
        await this.aggregatorService.getInfoDistrictByEngName(district);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(
        `Info found. DISTRICT: ${district} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
      );

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(
        `Error. DISTRICT: ${district} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        error.stack,
      );
      throw error;
    }
  }
  @Get('/get/districtEngName/onFiasID')
  async getDistrictEngNameByFiasID(
    @Query() query: GetDistrictEngNameByFiasIDDto,
    @Req() request: Request,
  ): Promise<{ engNameDistrict: string }> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();
    const { fiasID } = query;

    try {
      const result =
        await this.aggregatorService.getDistrictEngNameByFiasID(fiasID);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(
        `District found by FiasID. FiasID: ${fiasID} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
      );

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(
        `Error. FiasID: ${fiasID} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        error.stack,
      );
      throw error;
    }
  }

  // Работа с ростелекомом
  @Get('/get/tarrifsRTK/onAddress')
  async getTarrifsRTKOnAddress(
    @Query() query: GetTarrifsRTKOnAddressDto,
    @Req() request: Request,
  ): Promise<Tariff[] | boolean> {
    const clientIp = request.ip || request.socket.remoteAddress;
    const requestPath = request.originalUrl;
    const startTime = Date.now();
    const { address } = query;

    try {
      const result =
        await this.aggregatorService.getTarrifsRTKOnAddress(address);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(
        `Tarriffs rtk found. ADDRESS: ${address} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
      );

      return result;
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.error(
        `Error. ADDRESS: ${address} || IP: ${clientIp} || PATH: ${requestPath} || Время выполнения: ${executionTime} мс`,
        error.stack,
      );
      throw error;
    }
  }
}
