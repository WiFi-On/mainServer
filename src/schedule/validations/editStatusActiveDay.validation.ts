import { IsInt, IsNotEmpty, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditStatusActiveDayValidation {
  @ApiProperty({
    description: 'Хук для изменения статуса рабочих дней от сотрудников',
  })
  @IsString()
  @IsNotEmpty({ message: 'Данные для авторизации не могут быть пустыми.' })
  initData: string;

  @IsInt()
  @IsNotEmpty({ message: 'ID рабочего дня не может быть пустым' })
  id: number;

  @IsString()
  @IsNotEmpty({ message: 'Статус не может быть пустым' })
  @IsIn(['В ожидании', 'Отказ', 'Согласовано'])
  status: string;
}
