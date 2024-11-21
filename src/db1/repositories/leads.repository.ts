import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../entities/lead.entity';

@Injectable()
export class LeadsRepository {
  constructor(
    @InjectRepository(Lead)
    private readonly leadsRepository: Repository<Lead>,
  ) {}

  async addLead(
    idLead: number,
    idPartner: number,
    fio: string,
    tel: string,
    comment: string,
    address: string,
  ): Promise<Lead> {
    try {
      const lead = await this.leadsRepository.save({
        id: idLead,
        partner: { id: idPartner },
        fio,
        tel,
        comment,
        address,
      });

      return lead;
    } catch (error) {
      console.error('Error adding lead:', error);
      throw new Error('Could not add lead'); // Выбрасываем ошибку, если что-то пошло не так
    }
  }

  async getLeadsByPartner(idPartner: number): Promise<Lead[]> {
    try {
      const leads = await this.leadsRepository.find({
        where: { partner: { id: idPartner } },
      });

      return leads;
    } catch (error) {
      console.error('Error retrieving leads by partner:', error);
      throw new Error('Could not retrieve leads by partner');
    }
  }

  async getAllLeads(): Promise<Lead[]> {
    try {
      const leads = await this.leadsRepository.find();

      return leads;
    } catch (error) {
      console.error('Error retrieving all leads:', error);
      throw new Error('Could not retrieve leads');
    }
  }

  async getLeadById(id: number): Promise<Lead | null> {
    try {
      const lead = await this.leadsRepository.findOneBy({ id });

      return lead;
    } catch (error) {
      console.error('Error retrieving lead by id:', error);
      throw new Error('Could not retrieve lead');
    }
  }
}
