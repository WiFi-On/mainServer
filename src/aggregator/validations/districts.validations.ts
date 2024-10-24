import { IsNotEmpty, IsString } from 'class-validator';

export class GetDistrictInfoValidation {
  @IsNotEmpty({ message: 'District не может быть пустым.' })
  @IsString({ message: 'District должен быть строкой.' })
  district: string;
}

export class GetDistrictEngNameByFiasIDValidation {
  @IsNotEmpty({ message: 'FiasID не может быть пустым.' })
  @IsString({ message: 'FiasID должен быть строкой.' })
  fiasID: string;
}
