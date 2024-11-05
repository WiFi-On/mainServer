import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetDistrictInfoValidation {
  @ApiProperty({
    description: 'Населенный пункт',
    example: 'Tyumen',
  })
  @IsNotEmpty({ message: 'District не может быть пустым.' })
  @IsString({ message: 'District должен быть строкой.' })
  district: string;
}

export class GetDistrictEngNameByFiasIDValidation {
  @ApiProperty({
    description: 'FiasID',
    example: '9ae64229-9f7b-4149-b27a-d1f6ec74b5ce',
  })
  @IsNotEmpty({ message: 'FiasID не может быть пустым.' })
  @IsString({ message: 'FiasID должен быть строкой.' })
  fiasID: string;
}
