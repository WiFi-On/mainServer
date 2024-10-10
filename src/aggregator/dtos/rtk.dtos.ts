import { IsNotEmpty, IsString } from 'class-validator';

export class GetTarrifsRTKOnAddressDto {
  @IsNotEmpty({ message: 'Address не может быть пустым.' })
  @IsString({ message: 'Address должен быть строкой.' })
  address: string;
}
