import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// entities
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { District } from './entities/district.entity';
import { Email } from './entities/email.entity';
import { Lead } from './entities/lead.entity';
import { Partner } from './entities/partner.entity';
import { Tariff } from './entities/tariff.entity';
import { Street } from './entities/street.entity';
import { Provider } from './entities/provider.entity';
import { ProviderOnStreet } from './entities/provideronstreet.entity';
import { TechologiesOnStreet } from './entities/techologiesonstreet.entity';
import { ActiveDay } from './entities/active_day.entity';
import { ScheduleUser } from './entities/schedule_user.entity';
// repositories
import { DistrictsRepository } from './repositories/districts.repository';
import { LeadsRepository } from './repositories/leads.repository';
import { ProvidersRepository } from './repositories/providers.repository';
import { TariffsRepository } from './repositories/tariffs.repository';
import { UsersRepository } from './repositories/users.repository';
import { ScheduleUsersRepository } from './repositories/schedule_users.repository';
import { ActiveDaysRepository } from './repositories/active_days.repository';

// Работа с первой базой. Тут все кроме работы с адреской eissd(Ростелеком).
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, District, Email, Lead, Partner, Tariff, Street, Provider, ProviderOnStreet, TechologiesOnStreet, ActiveDay, ScheduleUser]),
  ],
  providers: [UsersRepository, DistrictsRepository, LeadsRepository, ProvidersRepository, TariffsRepository, ScheduleUsersRepository, ActiveDaysRepository],
  exports: [UsersRepository, DistrictsRepository, LeadsRepository, ProvidersRepository, TariffsRepository, ScheduleUsersRepository, ActiveDaysRepository],
})
export class DbModule1 {}
