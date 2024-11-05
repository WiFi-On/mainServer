import { IsOptional, IsNotEmpty, IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetProvidersOnAddressValidation {
  @ApiProperty({
    description: 'Адрес',
    example: 'г Тюмень, ул Широтная, д 105',
  })
  @IsNotEmpty({ message: 'Address не может быть пустым.' })
  @IsString({ message: 'Address должен быть строкой.' })
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
    if (!value) return [];
    return value.split(',').map((id: string) => parseInt(id, 10));
  })
  providers?: number[];
}

export class GetProvidersOnHashAddressValidation {
  @ApiProperty({
    description: 'Хэш(md5) адреса',
    example: '025cb30304ee543d3e26be54b5d86153',
  })
  @IsNotEmpty({ message: 'HashAddress не может быть пустым.' })
  @IsString({ message: 'HashAddress должен быть строкой.' })
  hashAddress: string;

  @ApiProperty({
    description: 'ID провайдеров (опционально)',
    example: [1, 2, 3],
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (!value) return [];
    return value.split(',').map((id: string) => parseInt(id, 10));
  })
  providers?: number[];
}

export class GetProvidersOnDistrictValidation {
  @IsNotEmpty({ message: 'District не может быть пустым.' })
  @IsString({ message: 'District должен быть строкой.' })
  district: string;
}
