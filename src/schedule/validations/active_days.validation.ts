import { IsInt, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddActiveDayValidation {
  @ApiProperty({
    description: 'Хук для заведения рабочих дней от сотрудников',
  })
  @IsString()
  @IsNotEmpty({ message: 'Данные для авторизации не могут быть пустыми.' })
  initData: string;

  @IsInt()
  @IsNotEmpty({ message: 'ID сотрудника не может быть пустым.' })
  idEmployee: number;

  @IsString()
  @IsNotEmpty({ message: 'Дата работы не может быть пустой.' })
  date: string;

  @IsString()
  @IsNotEmpty({ message: 'Время начало работы не может быть пустым.' })
  startTime: string;

  @IsString()
  @IsNotEmpty({ message: 'Время конца работы не может быть пустым.' })
  endTime: string;

  @IsBoolean()
  @IsNotEmpty({ message: 'Рабочее место' })
  officeWork: boolean;
}
