import { Injectable } from '@nestjs/common';

import { LeadsRepository } from '../db/repositories/leads.repository';
import { Lead } from '../db/entities/lead.entity';
import { BitrixService } from 'src/bitrix/bitrix.service';
import { ReturnInfoLead } from './interfaces/services/InfoLead.interface';
import { BitrixReturnData } from '../bitrix/interfaces/BitrixReturnData.interface';

@Injectable()
export class PartnerService {
  // Теперь idsBitrix объявлен как поле класса, а не через конструктор
  private readonly idsBitrix = {
    1: { id: 31, name: 'gdelu' },
    2: { id: 32, name: 'ISP' },
  };

  constructor(
    private readonly leadsRepository: LeadsRepository,
    private readonly bitrixService: BitrixService,
  ) {}

  async addLead(
    idLead: number,
    idPartner: number,
    fio: string,
    tel: string,
    comment: string,
    address: string,
  ): Promise<ReturnInfoLead> {
    if (!fio) {
      fio = 'Уточнить';
    }

    // Инициализируем объект result
    const result: ReturnInfoLead = {
      client: {
        address: '',
        comment: '',
        fio: '',
        partner: { id: 0, name: '' },
        tel: '',
        id: 0,
        dateCreate: new Date(),
      },
      idClientBitrix: 0,
      idLeadBitrix: 0,
    };

    // Присваиваем значения полям объекта result.client
    result.client.address = address;
    result.client.comment = comment;
    result.client.fio = fio;
    result.client.partner.name = this.idsBitrix[idPartner].name;
    result.client.partner.id = idPartner;
    result.client.tel = tel;
    result.client.id = idLead;
    result.client.dateCreate = new Date();

    let lead: Lead;
    try {
      lead = await this.leadsRepository.addLead(
        idLead,
        idPartner,
        fio,
        tel,
        comment,
        address,
      );
    } catch (error) {
      throw new Error(`Ошибка при добавлении лида: ${error.message}`);
    }

    console.log('Занесено в базу:', lead);
    let contact: BitrixReturnData;
    try {
      contact = await this.bitrixService.createContact(
        lead.fio,
        '',
        '',
        lead.tel,
        lead.address,
      );

      result.idClientBitrix = contact.result;
    } catch (error) {
      throw new Error(
        `Ошибка при создании контакта в Bitrix: ${error.message}`,
      );
    }

    console.log('Создан контакт:', contact);
    console.log(this.idsBitrix[idPartner]);
    let deal: BitrixReturnData;
    try {
      deal = await this.bitrixService.createDeal(
        contact.result,
        this.idsBitrix[idPartner].id,
        lead.address,
        lead.comment,
        idLead,
      );

      console.log('Создана сделка:', deal);
      result.idLeadBitrix = deal.result;
    } catch (error) {
      throw new Error(`Ошибка при создании сделки в Bitrix: ${error.message}`);
    }

    return result;
  }
}
