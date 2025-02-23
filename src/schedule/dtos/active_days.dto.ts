import { IsNotEmpty, IsString, IsBoolean, Matches } from 'class-validator';
import { IsStartTimeBeforeEndTime } from './validations/StartTimeBeforeEndTime.validation';
import { IsDateNotBeforeToday } from './validations/DateNotBeforeToday.validation';

export class AddActiveDayDto {
  @IsString()
  @IsNotEmpty({ message: 'Дата работы не может быть пустой.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Дата работы должна быть в формате "ГГГГ-ММ-ДД".' })
  @IsDateNotBeforeToday({ message: 'Дата не может быть раньше сегодняшнего дня.' })
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

  @IsStartTimeBeforeEndTime('startTime', 'endTime', {
    message: 'Время начала работы не может быть больше времени окончания работы.',
  })
  validateTime: boolean;
}
