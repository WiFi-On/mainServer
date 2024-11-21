import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetThvValidation {
  @ApiProperty({
    description: 'Адрес',
    example: 'Тюмень, Широтная 100',
  })
  @IsNotEmpty({ message: 'Address не может быть пустым.' })
  @IsString({ message: 'Address должен быть строкой.' })
  address: string;
}
