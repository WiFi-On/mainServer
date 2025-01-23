import { IsString, IsNotEmpty } from 'class-validator';

export class CheckInitDataDto {
  @IsString()
  @IsNotEmpty({ message: 'Данные для авторизации не могут быть пустыми.' })
  initData: string;
}
