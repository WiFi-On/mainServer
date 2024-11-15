import { Module } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Lead } from '../db1/entities/lead.entity';
import { Partner } from '../db1/entities/partner.entity';

import { PartnerController } from './partner.controller';

import { DbModule1 } from 'src/db1/db.module';
import { BitrixModule } from 'src/bitrix/bitrix.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Partner]), DbModule1, BitrixModule],
  controllers: [PartnerController],
  providers: [PartnerService],
  exports: [PartnerService],
})
export class PartnerModule {}
