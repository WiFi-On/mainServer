import { Module } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Lead } from '../db/entities/lead.entity';
import { Partner } from '../db/entities/partner.entity';

import { PartnerController } from './partner.controller';

import { DbModule } from 'src/db/db.module';
import { BitrixModule } from 'src/bitrix/bitrix.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Partner]), DbModule, BitrixModule],
  controllers: [PartnerController],
  providers: [PartnerService],
  exports: [PartnerService],
})
export class PartnerModule {}
