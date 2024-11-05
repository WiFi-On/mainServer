import { ApiProperty } from '@nestjs/swagger';
import { ProviderDTO } from './provider.dto';

class TechnologiesDTO {
  @ApiProperty({
    description: 'XDSL технология подключения',
    example: true,
    required: true,
  })
  xdsl: boolean;

  @ApiProperty({
    description: 'FFTX технология подключения',
    example: true,
    required: true,
  })
  fftx: boolean;

  @ApiProperty({
    description: 'PON технология подключения',
    example: true,
    required: true,
  })
  pon: boolean;

  @ApiProperty({
    description: 'PSTM технология подключения',
    example: false,
    required: true,
  })
  pstm: boolean;

  @ApiProperty({
    description: 'WBA технология подключения',
    example: false,
    required: true,
  })
  wba: boolean;

  @ApiProperty({
    description: 'DOCSIS технология подключения',
    example: false,
    required: true,
  })
  docsis: boolean;

  @ApiProperty({
    description: 'Unknown технология подключения',
    example: false,
    required: true,
  })
  unknown: boolean;
}
export class TariffDTO {
  @ApiProperty({ description: 'ID тарифа', example: 1, required: true })
  id: number;

  @ApiProperty({
    description: 'Скорость интернета',
    type: Number,
    example: 100,
    required: false,
  })
  internet_speed: number;

  @ApiProperty({
    description: 'Количество каналов',
    type: Number,
    example: 1,
    required: false,
  })
  channels_count: number;

  @ApiProperty({
    description: 'Количество минут',
    type: Number,
    required: false,
    example: 600,
  })
  minutes: number;

  @ApiProperty({
    description: 'Количество гигабайт',
    type: Number,
    example: 30,
    required: false,
  })
  gigabytes: number;

  @ApiProperty({
    description: 'Количество SMS',
    type: Number,
    example: 10,
    required: false,
  })
  sms: number;

  @ApiProperty({
    description: 'Стоимость подключения',
    type: Number,
    example: 1000,
    required: false,
  })
  connection_cost: number;

  @ApiProperty({
    description: 'Стоимость тарифа',
    type: Number,
    example: 1000,
    required: true,
  })
  cost: number;

  @ApiProperty({
    description: 'Цена со скидкой',
    type: Number,
    example: 900,
    required: false,
  })
  sale_cost: number;

  @ApiProperty({
    description: 'Описание скидки',
    type: String,
    example: '1.0',
    required: false,
  })
  sale_description: string;

  @ApiProperty({
    description: 'Название тарифа',
    type: String,
    required: true,
    example: 'Пакет 1',
  })
  name: string;

  @ApiProperty({
    description: 'Аренда роутера',
    type: Number,
    required: false,
    example: 149,
  })
  router_rent: number;

  @ApiProperty({
    description: 'Стоимость роутера',
    type: Number,
    required: false,
    example: 5999,
  })
  router_cost: number;

  @ApiProperty({
    description: 'Платеж за роутер',
    type: Number,
    required: false,
    example: 399,
  })
  router_payment: number;

  @ApiProperty({
    description: 'Аренда ТВ-приставки',
    type: Number,
    required: false,
    example: 149,
  })
  tv_box_rent: number;

  @ApiProperty({
    description: 'Стоимость ТВ-приставки',
    type: Number,
    required: false,
    example: 14900,
  })
  tv_box_cost: number;

  @ApiProperty({
    description: 'Платеж за ТВ-приставку',
    type: Number,
    required: false,
    example: 349,
  })
  tv_box_payment: number;

  @ApiProperty({
    description: 'Технологии',
    type: TechnologiesDTO,
    required: true,
  })
  technologies: TechnologiesDTO;

  @ApiProperty({ description: 'Тип тарифа', example: 1, required: true })
  type: number;

  @ApiProperty({
    description: 'Дополнительная информация',
    required: false,
    example: 'Описание тарифа',
  })
  additional_info: string;

  @ApiProperty({
    description: 'Поставщик услуги',
    type: ProviderDTO,
    required: true,
  })
  provider: ProviderDTO;
}
export class NoTariffDTO {
  @ApiProperty({
    description: 'Ответ ошибки',
    example: 'Тариф не найден',
    required: true,
  })
  message: string;

  @ApiProperty({
    description: 'Текстовый статус ошибки',
    example: 'Not found',
    required: true,
  })
  error: string;

  @ApiProperty({
    description: 'Код ошибки',
    example: 404,
    required: true,
  })
  statusCode: number;
}
export class NoTariffsDTO {
  @ApiProperty({
    description: 'Ответ ошибки',
    example: 'Тарифы не найдены',
    required: true,
  })
  message: string;

  @ApiProperty({
    description: 'Текстовый статус ошибки',
    example: 'Not found',
    required: true,
  })
  error: string;

  @ApiProperty({
    description: 'Код ошибки',
    example: 404,
    required: true,
  })
  statusCode: number;
}
