import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Ad } from './ad.entity';
import { Bid } from './bid.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  @Column({ name: 'first_name', type: 'varchar' })
  first_name: string;

  @Column({ name: 'last_name', type: 'varchar' })
  last_name: string;

  @Column({ name: 'email', unique: true, type: 'varchar' })
  email: string;

  @Column({ name: 'password', type: 'varchar' })
  password: string;

  @OneToMany(() => Ad, (car) => car.owner, {
    cascade: false,
    onDelete: 'CASCADE',
  })
  cars: Ad[];

  @OneToMany(() => Bid, (bid) => bid.user, {
    cascade: false,
    onDelete: 'CASCADE',
  })
  bids: Bid[];
}
