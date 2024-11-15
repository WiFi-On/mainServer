import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { emailOutput, parsEmail, imapConfigI } from './email.interfaces';
import { simpleParser } from 'mailparser';
import * as imap from 'imap-simple';

@Injectable()
export class EmailService {
  private readonly imapConfig: imapConfigI;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    // Настройка конфигурации IMAP
    this.imapConfig = {
      imap: {
        user: this.configService.get<string>('EMAIL_USER'),
        password: this.configService.get<string>('EMAIL_PASSWORD'),
        host: this.configService.get<string>('IMAP_HOST'),
        port: this.configService.get<number>('IMAP_PORT'),
        tls: true,
        authTimeout: 5000,
      },
    };
  }
  async getEmails(
    folder = 'INBOX',
    startDate?: Date,
    endDate?: Date,
    from?: string,
  ): Promise<parsEmail[]> {
    try {
      const connection = await imap.connect(this.imapConfig);
      await connection.openBox(folder); // Открываем указанную папку

      // Критерии поиска писем
      const searchCriteria: any = ['ALL'];

      // Добавляем фильтрацию по начальной дате, если она указана
      if (startDate) {
        const formattedStartDate = startDate.toISOString().split('T')[0]; // Форматируем дату в формат YYYY-MM-DD
        searchCriteria.push(['SINCE', formattedStartDate]);
      }

      // Добавляем фильтрацию по конечной дате, если она указана
      if (endDate) {
        const formattedEndDate = endDate.toISOString().split('T')[0]; // Форматируем дату в формат YYYY-MM-DD
        searchCriteria.push(['BEFORE', formattedEndDate]);
      }

      // Добавляем фильтрацию по отправителю, если указан
      if (from) {
        searchCriteria.push(['FROM', from]);
      }

      const fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        markSeen: false,
      };

      const results = await connection.search(searchCriteria, fetchOptions);

      if (results.length === 0) {
        console.log('Нет писем, соответствующих заданным критериям.');
        connection.end();
        return [];
      }

      // Асинхронный парсинг писем
      const parsedEmails = await Promise.all(
        results.map((emailObject) => this.parseEmailData(emailObject)),
      );

      connection.end();
      return parsedEmails;
    } catch (error) {
      console.error('Ошибка при получении писем:', error);
      return [];
    }
  }
  async getISPEmails(
    folder = 'INBOX',
    startDate?: Date,
    endDate?: Date,
  ): Promise<emailOutput[]> {
    const emailsAlena = await this.getEmails(
      folder,
      startDate,
      endDate,
      'Л, Алёна <vo@isp-vrn.ru>',
    );
    const emailsISP = await this.getEmails(
      folder,
      startDate,
      endDate,
      'ISP <no-reply@isp-vrn.ru>',
    );

    if (
      (!emailsAlena || emailsAlena.length === 0) &&
      (!emailsISP || emailsISP.length === 0)
    ) {
      return [];
    }

    const parsedAlena = await Promise.all(
      emailsAlena.map(async (email) => {
        const parsedBodyToText = await this.parseBodyToText(email.body);
        const parsedISP = await this.parseBodyEmailISP(parsedBodyToText);
        parsedISP.date = email.date;
        parsedISP.email = email.from;
        return parsedISP;
      }),
    );

    const parsedISP = await Promise.all(
      emailsISP.map(async (email) => {
        const parsedISP = await this.parseBodyEmailISP(email.body);
        parsedISP.date = email.date;
        parsedISP.email = email.from;
        return parsedISP;
      }),
    );

    return [...parsedAlena, ...parsedISP];
  }
  async getGdeluEmails(
    folder = 'INBOX',
    startDate?: Date,
    endDate?: Date,
  ): Promise<emailOutput[]> {
    const emailsGdelu = await this.getEmails(
      folder,
      startDate,
      endDate,
      'clients@gdelu.ru',
    );
    if (!emailsGdelu || emailsGdelu.length === 0) {
      return [];
    }
    const parsedGdelu = await Promise.all(
      emailsGdelu.map(async (email) => {
        const decode = await this.decoderBase64(email.body);
        const parsedGDELU = await this.parseBodyEmailGDELU(decode);
        parsedGDELU.date = email.date;
        parsedGDELU.email = email.from;
        return parsedGDELU;
      }),
    );
    return parsedGdelu;
  }

  // Вспомогательные функции
  private async parseBodyEmailISP(body: string): Promise<emailOutput> {
    // Удаляем все <br /> из тела письма
    const cleanedBody = body.replace(/<br\s*\/?>/gi, '\n');

    // Разделяем очищенное тело письма по строкам
    const arrBody = cleanedBody.split('\n');

    // Инициализируем результат
    const result = {
      name: '',
      address: '',
      phone: '',
      id: '',
      comment: '',
    };

    // Разбираем строки и заполняем результат
    arrBody.forEach((item) => {
      if (item.includes('Телефон:')) {
        result.phone = item.split(':')[1].trim();
      } else if (item.includes('Имя:')) {
        result.name = item.split(':')[1].trim();
      } else if (item.includes('Номер заявки:')) {
        result.id = item.split(':')[1].trim();
      } else if (item.includes('Примечание:')) {
        result.comment = item.split(':')[1].trim();
      } else if (
        !item.includes('Примечание:') &&
        item.includes('Клиент указал желаемый способ связи:')
      ) {
        result.comment = item.split(':')[1].trim();
        if (result.comment) {
          result.comment =
            'Клиент указал желаемый способ связи:' + result.comment;
        }
      } else if (item.includes('Адрес:')) {
        result.address = item.split(':')[1].trim();
      }
    });

    return result;
  }
  private async parseBodyEmailGDELU(body: string): Promise<emailOutput> {
    // Удаляем все <br /> из тела письма
    const cleanedBody = body.replace(/<br\s*\/?>/gi, '\n');
    // Разделяем очищенное тело письма по строкам
    const arrBody = cleanedBody.split('\n');
    // Инициализируем результат
    const result = {
      name: '',
      address: '',
      phone: '',
      id: '',
      comment: '',
    };

    result.name = arrBody[3];
    result.address = arrBody[13];
    result.phone = arrBody[4].split(':')[1];
    result.id = arrBody[1].split('№')[1];
    result.comment = arrBody[15].split('Комментарий:')[1];

    return result;
  }
  private async decoderBase64(body: string): Promise<string> {
    const base64Decoded = Buffer.from(body, 'base64').toString('utf-8');
    return base64Decoded;
  }
  private async parseBodyToText(body: string): Promise<string> {
    const email = await simpleParser(body);
    return email.text;
  }
  private async parseEmailData(emailObject: imap.Message): Promise<parsEmail> {
    if (!emailObject) {
      console.error('Email object is undefined or null');
      return null;
    }

    // Извлечение данных из атрибутов
    const id = emailObject.attributes?.uid;
    const date = emailObject.attributes?.date;

    // Извлечение заголовков
    const headerPart = emailObject.parts.find(
      (part) => part.which === 'HEADER',
    );
    const from = headerPart?.body?.['from']?.[0] || 'Не указано';
    const subject = headerPart?.body?.['subject']?.[0] || 'Без темы';

    // Извлечение тела письма
    const textPart = emailObject.parts.find((part) => part.which === 'TEXT');
    const body = textPart?.body || 'Тело письма отсутствует';

    // Возвращаем объект с извлечённой информацией
    return {
      id,
      date,
      from,
      subject,
      body,
    };
  }
}
