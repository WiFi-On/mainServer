import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from './user.entity'; // Импортируйте вашу сущность User

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  role: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[]; // Связь с пользователями
}
