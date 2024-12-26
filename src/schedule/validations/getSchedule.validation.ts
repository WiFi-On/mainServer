import { IsOptional, IsString, IsInt, IsIn, IsBoolean } from 'class-validator';

export class GetScheduleValidation {
  @IsString()
  initData: string;

  @IsOptional()
  @IsInt()
  idEmployee?: number;

  @IsOptional()
  @IsBoolean()
  office?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['В ожидании', 'Отказ', 'Согласовано'])
  status?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
