import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ad } from './ad.entity';

@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  // bidder (string)
  @Column({ name: 'user', type: 'varchar' })
  user: string;

  // amount (float)
  @Column({ name: 'amount', type: 'float' })
  amount: number;

  // timestamp of bid
  @CreateDateColumn({ name: 'time', type: 'timestamp' })
  time: Date;

  // relation to Ad (ad_id FK)
  @ManyToOne(() => Ad, (ad) => ad.bids, {
    cascade: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ad_id' })
  car: Ad;
}
