import { IsNotEmpty, IsString } from 'class-validator';

export class GetTarrifsRTKOnAddressValidation {
  @IsNotEmpty({ message: 'Address не может быть пустым.' })
  @IsString({ message: 'Address должен быть строкой.' })
  address: string;
}
