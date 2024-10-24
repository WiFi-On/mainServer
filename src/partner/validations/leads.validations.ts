import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

export class AddLeadValidation {
  @IsNotEmpty({ message: 'id не должно быть пустым' })
  @IsNumber({}, { message: 'id должно быть целым числом' }) // Указываем кастомное сообщение
  readonly id: number;

  @IsOptional()
  @IsString({ message: 'fio должно быть строкой' })
  readonly fio?: string;

  @IsNotEmpty({ message: 'tel не должно быть пустым' })
  @IsString({ message: 'tel должно быть строкой' })
  readonly tel: string;

  @IsOptional()
  @IsString({ message: 'comment должно быть строкой' })
  readonly comment?: string;

  @IsNotEmpty({ message: 'address не должно быть пустым' })
  @IsString({ message: 'address должно быть строкой' })
  readonly address: string;
}
