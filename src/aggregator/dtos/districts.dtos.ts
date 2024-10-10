import { IsNotEmpty, IsString } from 'class-validator';

export class GetDistrictInfoDto {
  @IsNotEmpty({ message: 'District не может быть пустым.' })
  @IsString({ message: 'District должен быть строкой.' })
  district: string;
}

export class GetDistrictEngNameByFiasIDDto {
  @IsNotEmpty({ message: 'FiasID не может быть пустым.' })
  @IsString({ message: 'FiasID должен быть строкой.' })
  fiasID: string;
}
