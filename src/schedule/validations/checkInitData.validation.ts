import { IsString } from 'class-validator';

export class CheckInitDataValidation {
  @IsString()
  initData: string;
}
