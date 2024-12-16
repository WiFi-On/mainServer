import { ApiProperty } from '@nestjs/swagger';

export class LeadReadyDTO {
  @ApiProperty({
    description: 'id заявки',
    example: '122',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'Статус заявки',
    example: 'Заявка занесена',
    required: true,
  })
  result: string;
}
