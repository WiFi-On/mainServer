import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class ThvDTO {
  @ApiProperty({
    description: 'Название технологии подключения',
    example: 'PSTN',
    required: true,
  })
  TechName: string;

  @ApiProperty({
    description: 'Результат технологии подключения',
    example: 'Y',
    required: true,
  })
  Res: string;
}

export class ThvArrayDTO {
  @ApiProperty({
    description: 'Массив технологий подключения',
    type: [ThvDTO], // Указываем, что это массив DTO
  })
  @ValidateNested({ each: true }) // Валидируем каждый элемент массива
  @Type(() => ThvDTO) // Трансформируем элементы массива в ThvDTO
  items: ThvDTO[];
}

export class noThvDTO {
  @ApiProperty({
    description: 'Ответ ошибки',
    example: 'Ошибка в получении информации от DaData',
    required: true,
  })
  message: string;
}
