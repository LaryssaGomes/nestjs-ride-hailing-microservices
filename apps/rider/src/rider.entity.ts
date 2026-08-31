import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Rider {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ unique: true, nullable: false })
  userId!: number;
}
