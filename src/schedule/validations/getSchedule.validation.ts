import { IsOptional, IsString, IsIn, IsBoolean, Matches } from 'class-validator';

export class GetScheduleValidation {
  @IsString()
  initData: string;

  @IsOptional()
  @IsBoolean()
  office?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['В ожидании', 'Отказ', 'Согласовано'])
  status?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Дата работы должна быть в формате "ГГГГ-ММ-ДД".' })
  @IsString()
  startDate?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Дата работы должна быть в формате "ГГГГ-ММ-ДД".' })
  @IsString()
  endDate?: string;
}
