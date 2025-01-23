import { IsInt, IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { IsStartTimeBeforeEndTime } from './validations/StartTimeBeforeEndTime.validation';

export class EditActiveDayDto {
  @IsInt()
  @IsNotEmpty({ message: 'ID рабочего дня не может быть пустым' })
  id: number;

  @IsOptional()
  @IsString()
  startTime: string;

  @IsOptional()
  @IsString()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  officeWork: boolean;

  @IsStartTimeBeforeEndTime('startTime', 'endTime', {
    message: 'Время начала работы не может быть больше времени окончания работы.',
  })
  validateTime: boolean;
}
