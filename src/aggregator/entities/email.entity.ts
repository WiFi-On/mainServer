import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('emails')
export class Email {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;
}
