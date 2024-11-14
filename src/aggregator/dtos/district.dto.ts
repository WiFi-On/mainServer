import { ApiProperty } from '@nestjs/swagger';

export class DistrictInfoDTO {
  @ApiProperty({
    description: 'ID населенного пункта',
    example: '9ae64229-9f7b-4149-b27a-d1f6ec74b5ce',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'Название населенного пункта',
    example: 'Тюмень',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'Название населенного пункта в склонении',
    example: 'Тюмени',
    required: true,
  })
  namewhere: number;

  @ApiProperty({
    description: 'Название населенного пункта на английском',
    example: 'Tyumen',
    required: true,
  })
  engname: string;
}
export class NoDistrictsDTO {
  @ApiProperty({
    description: 'Ответ ошибки',
    example: 'Населенные пункты не найдены',
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
export class NoDistrictDTO {
  @ApiProperty({
    description: 'Ответ ошибки',
    example: 'Населенный пункт не найден',
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
