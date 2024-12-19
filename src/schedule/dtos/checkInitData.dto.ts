import { IsString } from 'class-validator';

export class CheckInitDataDto {
  @IsString()
  initData: string;
}
