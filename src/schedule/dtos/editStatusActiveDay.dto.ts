import { IsInt, IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

export class EditStatusActiveDayDto {
  @IsInt()
  @IsNotEmpty({ message: 'ID рабочего дня не может быть пустым' })
  id: number;

  @IsOptional()
  @IsString()
  @IsIn(['В ожидании', 'Отказ', 'Согласовано'])
  status: string;
}
