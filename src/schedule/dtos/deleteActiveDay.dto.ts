import { IsNumber } from 'class-validator';

export class DeleteActiveDayDto {
  @IsNumber()
  id: number;
}
