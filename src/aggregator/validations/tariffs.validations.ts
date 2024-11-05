// src/aggregator/validations/tariffs.validations.ts
import {
  IsInt,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetTariffValidation {
  @ApiProperty({
    description: 'ID тарифа',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty({ message: 'ID не может быть пустым.' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  id: number;
}
export class GetTariffsOnAddressValidation {
  @ApiProperty({
    description: 'Адрес',
    example: 'г Тюмень, ул Широтная, д 105',
  })
  @IsNotEmpty({ message: 'Адрес не может быть пустым.' })
  @IsString({ message: 'Адрес должен быть строкой.' })
  address: string;

  @ApiProperty({
    description: 'ID провайдеров (опционально)',
    example: [1, 2, 3],
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (!value) return []; // Лучше возвращать пустой массив, если providers не передан
    return value.split(',').map((id: string) => parseInt(id, 10)); // Преобразуем строку в массив чисел
  })
  providers?: number[];
}
export class GetTariffsOnHashAddressValidation {
  @ApiProperty({
    description: 'Хэш(md5) адреса',
    example: '025cb30304ee543d3e26be54b5d86153',
  })
  @IsNotEmpty({ message: 'Hash не может быть пустым.' })
  @IsString({ message: 'Hash должен быть строкой.' })
  hash: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (!value) return [];
    return value.split(',').map((id: string) => parseInt(id, 10));
  })
  providers?: number[];
}

export class GetTariffsOnDistrictValidation {
  @ApiProperty({
    description: 'Населенный пункт',
    example: 'Tyumen',
  })
  @IsNotEmpty({ message: 'District не может быть пустым.' })
  @IsString({ message: 'District должен быть строкой.' })
  district: string;
}
