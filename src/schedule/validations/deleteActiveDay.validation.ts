import { IsNumber, IsString } from 'class-validator';

export class DeleteActiveDayValidation {
  @IsString()
  initData: string;

  @IsNumber()
  id: number;
}
