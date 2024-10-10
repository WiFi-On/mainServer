import {
  IsInt,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GetTariffDto {
  @IsInt()
  @IsNotEmpty({ message: 'ID не может быть пустым.' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  id: number;
}
export class GetTariffsOnAddressDto {
  @IsNotEmpty({ message: 'Адрес не может быть пустым.' })
  @IsString({ message: 'Адрес должен быть строкой.' })
  address: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (!value) return undefined; // Если providers не передан, вернем undefined
    return value.split(',').map((id: string) => parseInt(id, 10)); // Преобразуем строку в массив чисел
  })
  providers?: number[];
}
export class GetTariffsOnHashAddressDto {
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

export class GetTariffsOnDistrictDto {
  @IsNotEmpty({ message: 'District не может быть пустым.' })
  @IsString({ message: 'District должен быть строкой.' })
  district: string;
}
