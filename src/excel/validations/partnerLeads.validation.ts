import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PartnerLeadsValidation {
  @ApiProperty({
    description:
      'Хук для получения excel файла с заявками от партнеров Avatell',
  })
  @IsInt()
  @IsNotEmpty({ message: 'ID партнера не может быть пустым.' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  partnerId: number;

  @IsString()
  @IsNotEmpty({ message: 'Первая дата не может быть пустой' })
  startDate: string;

  @IsString()
  @IsNotEmpty({ message: 'Вторая дата не может быть пустой' })
  endDate: string;
}
