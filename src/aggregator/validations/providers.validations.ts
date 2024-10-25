import { IsOptional, IsNotEmpty, IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetProvidersOnAddressValidation {
  @IsNotEmpty({ message: 'Address не может быть пустым.' })
  @IsString({ message: 'Address должен быть строкой.' })
  address: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (!value) return [];
    return value.split(',').map((id: string) => parseInt(id, 10));
  })
  providers?: number[];
}

export class GetProvidersOnHashAddressValidation {
  @IsNotEmpty({ message: 'HashAddress не может быть пустым.' })
  @IsString({ message: 'HashAddress должен быть строкой.' })
  hashAddress: string;

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