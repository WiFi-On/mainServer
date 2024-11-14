// nest
import { Inject, HttpException, HttpStatus, Injectable } from '@nestjs/common';
// service
import * as xlsx from 'xlsx';
import * as archiver from 'archiver';
import { DadataService } from '../dadata/dadata.service';
import { AggregatorService } from '../aggregator/aggregator.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ExcelService {
  constructor(
    @Inject(AggregatorService)
    private readonly aggregatorService: AggregatorService,
    private readonly dadataService: DadataService,
    private readonly emailService: EmailService,
  ) {}

  // Функции для получения excel файла с тех.возможностями
  private async delflat(address: string): Promise<string> {
    const arrAddress = address.split(',');
    arrAddress.pop();
    return arrAddress.join(',').trim();
  }
  private async addHousing(address: string): Promise<string> {
    const arrAddress = address.split(',');
    let lastElement = arrAddress[arrAddress.length - 1];
    const arrHouse = lastElement.split(' ');

    if (arrHouse.length === 4) {
      lastElement = `${arrHouse[1]} ${arrHouse[2]} к. ${arrHouse[3]}`;
      arrAddress[arrAddress.length - 1] = lastElement;
    }

    return arrAddress.join(',');
  }
  async excelTc(fileBuffer: Buffer): Promise<Buffer> {
    const inputExcel = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheet = inputExcel.Sheets[inputExcel.SheetNames[0]];
    const rangeRef = sheet['!ref'];

    if (!rangeRef) {
      throw new HttpException(
        'Не удалось получить диапазон из листа Excel.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const range = xlsx.utils.decode_range(rangeRef);
    let addresses: string[] = [];
    let numbers: string[] = [];
    const TC: string[] = [];

    for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
      const idCellsNumber = xlsx.utils.encode_cell({ r: rowNum, c: 10 });
      const idCellsAddress = xlsx.utils.encode_cell({ r: rowNum, c: 5 });
      const idCellsState = xlsx.utils.encode_cell({ r: rowNum, c: 7 });

      const cellState = sheet[idCellsState];
      const cellStateValue = cellState ? cellState.v : undefined;

      if (cellStateValue === 'Услуга подключена' || cellStateValue === 'Тест') {
        continue;
      }

      let cellNumber = sheet[idCellsNumber];
      let cellAddress = sheet[idCellsAddress];

      cellNumber = cellNumber ? cellNumber.v : undefined;
      cellAddress = cellAddress ? cellAddress.v : undefined;

      if (cellAddress) {
        let address = await this.delflat(cellAddress);
        address = await this.addHousing(address);
        addresses.push(address);
      }
      if (cellNumber) {
        numbers.push(cellNumber);
      }
    }

    addresses = addresses.slice(1);
    numbers = numbers.slice(1);

    for (let i = 0; i < addresses.length; i++) {
      const value = await this.dadataService.addressCheck(addresses[i]);

      if (!value) {
        TC.push('Dadata не нашла');
        continue;
      }

      const providers =
        await this.aggregatorService.getProvidersOnAddressByAddress(value);
      if (!providers || providers.length === 0) {
        TC.push('Провайдеров нет');
      } else {
        const providersIds = providers.map((provider) => provider.id);
        TC.push(providersIds.join(', '));
      }
    }

    // Функция для записи файла в память
    const writeBuffer = (data: any[][]): Buffer => {
      const ws = xlsx.utils.aoa_to_sheet(data);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
      return xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
    };

    // Данные для записи в файлы
    const worksheetData = [
      ['Адрес', 'Номер', 'Техническая возможность(Провайдеры)'],
    ];
    const worksheetDataMts = [['Номер']];
    const worksheetDataMegafon = [['Номер']];
    const worksheetDataRusCom = [['Номер']];
    const worksheetDataTTK = [['Номер']];
    const worksheetDataAlmatel = [['Номер']];
    const worksheetDataNoCN = [
      ['Адрес', 'Номер', 'Техническая возможность(Провайдеры)'],
    ];

    // Заполнение данных для каждой категории провайдеров
    for (let i = 0; i < addresses.length; i++) {
      worksheetData.push([addresses[i], numbers[i], TC[i]]);

      if (TC[i].includes('2')) {
        worksheetDataMts.push([numbers[i]]);
      } else if (TC[i].includes('4')) {
        worksheetDataTTK.push([numbers[i]]);
      } else if (TC[i].includes('3')) {
        worksheetDataMegafon.push([numbers[i]]);
      } else if (TC[i].includes('1')) {
        worksheetDataRusCom.push([numbers[i]]);
      } else if (TC[i].includes('5')) {
        worksheetDataAlmatel.push([numbers[i]]);
      } else {
        worksheetDataNoCN.push([addresses[i], numbers[i], TC[i]]);
      }
    }

    // Генерация буферов Excel-файлов
    const buffers = {
      output: writeBuffer(worksheetData),
      outputMts: writeBuffer(worksheetDataMts),
      outputMegafon: writeBuffer(worksheetDataMegafon),
      outputTTK: writeBuffer(worksheetDataTTK),
      outputRusCom: writeBuffer(worksheetDataRusCom),
      outputAlmatel: writeBuffer(worksheetDataAlmatel),
      outputNoCN: writeBuffer(worksheetDataNoCN),
    };

    // Создание архива в памяти
    const archive = archiver('zip', { zlib: { level: 9 } });
    const archiveBuffers: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => {
      archiveBuffers.push(chunk);
    });

    archive.on('end', () => {
      console.log('ZIP-архив завершен.');
    });

    archive.append(buffers.output, { name: 'output.xlsx' });
    archive.append(buffers.outputMts, { name: 'outputMts.xlsx' });
    archive.append(buffers.outputMegafon, { name: 'outputMegafon.xlsx' });
    archive.append(buffers.outputTTK, { name: 'outputTTK.xlsx' });
    archive.append(buffers.outputRusCom, { name: 'outputRusCom.xlsx' });
    archive.append(buffers.outputAlmatel, { name: 'outputAlmatel.xlsx' });
    archive.append(buffers.outputNoCN, { name: 'outputNoCN.xlsx' });

    await archive.finalize();

    // Возвращаем буфер архива
    return Buffer.concat(archiveBuffers);
  }
  // Функции для получения excel файла с заявками от партнеров Avatell
  async excelPartnerLeads(
    partnerId?: number,
    startDate?: string,
    endDate?: string,
  ): Promise<Buffer> {
    // Получаем данные о заявках
    let leads = [];
    if (partnerId == 1) {
      leads = await this.emailService.getGdeluEmails(
        'ready',
        new Date(startDate),
        new Date(endDate),
      );
    } else if (partnerId == 2) {
      leads = await this.emailService.getISPEmails(
        'ready',
        new Date(startDate),
        new Date(endDate),
      );
    }

    // Создаем структуру данных с нужными заголовками
    const formattedLeads = leads.map((lead) => ({
      Дата: lead.date, // Дата
      id: lead.id, // ID
      Адрес: lead.address, // Адрес
      Телефон: lead.phone, // Телефон
      Комментарий: lead.comment, // Комментарий
      ФИО: lead.name, // Имя
    }));

    // Создаем рабочую книгу
    const ws = xlsx.utils.json_to_sheet(formattedLeads, {
      header: ['Дата', 'id', 'Адрес', 'Телефон', 'Комментарий', 'ФИО'],
    });

    // Создаем рабочую книгу в формате xlsx
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Leads');

    // Создаем буфер с файлом Excel
    const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

    return buffer;
  }
}
