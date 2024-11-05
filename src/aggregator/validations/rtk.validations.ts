import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetTarrifsRTKOnAddressValidation {
  @ApiProperty({
    description: 'Адрес',
    example: 'г Тюмень, ул Широтная, д 105',
  })
  @IsNotEmpty({ message: 'Address не может быть пустым.' })
  @IsString({ message: 'Address должен быть строкой.' })
  address: string;
}
