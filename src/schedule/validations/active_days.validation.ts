import { IsInt, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AddActiveDayValidation {
  @ApiProperty({
    description: 'Хук для заведения рабочих дней от сотрудников',
  })
  @IsInt()
  @IsNotEmpty({ message: 'ID сотрудника не может быть пустым.' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  idWorker: number;

  @IsString()
  @IsNotEmpty({ message: 'Дата работы не может быть пустой.' })
  date: string;

  @IsString()
  @IsNotEmpty({ message: 'Время начало работы не может быть пустым.' })
  startWorkTime: string;

  @IsString()
  @IsNotEmpty({ message: 'Время конца работы не может быть пустым.' })
  endWorkTime: string;

  @IsBoolean()
  @IsNotEmpty({ message: 'Рабочее место' })
  @Transform(({ value }) => JSON.parse(value), { toClassOnly: true })
  office: boolean;
}
