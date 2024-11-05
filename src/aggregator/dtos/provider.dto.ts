import { ApiProperty } from '@nestjs/swagger';

export class ProviderDTO {
  @ApiProperty({ description: 'ID провайдера', example: 1, required: true })
  id: number;

  @ApiProperty({
    description: 'Название провайдера',
    example: 'Мегафон',
    required: true,
  })
  name: string;
}

export class NoProvidersDTO {
  @ApiProperty({
    description: 'Ответ ошибки',
    example: 'Провайдеры не найдены',
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
