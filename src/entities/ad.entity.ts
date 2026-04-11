import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Bid } from './bid.entity';
import {
  BodyType,
  Feature,
  FuelType,
  RegisteredIn,
} from 'src/common/enums';

@Entity('ads')
export class Ad {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  @Column({ name: 'make', type: 'varchar' })
  make: string;

  @Column({ name: 'model', type: 'varchar' })
  model: string;

  @Column({ name: 'color', type: 'varchar' })
  color: string;

  @Column({ name: 'enigne_capacity', type: 'int' })
  engine_capacity: number;

  @Column({ name: 'variant', type: 'varchar' })
  variant: string;

  @Column({
    name: 'fuel_type',
    type: 'enum',
    enum: FuelType,
    default: FuelType.PETROL,
  })
  fuel_type: FuelType;

  @Column({ name: 'transmission', type: 'varchar' })
  transmission: string;

  @Column({ name: 'mileage', type: 'int' })
  mileage: number;

  @Column({
    name: 'body_type',
    type: 'enum',
    enum: BodyType,
    default: BodyType.DEFAULT,
  })
  body_type: BodyType;

  @Column({
    name: 'features',
    type: 'simple-json',
    default: null,
  })
  features: Feature[];

  @Column({
    name: 'pictures',
    type: 'simple-array',
    default: null,
  })
  images: string[];

  @Column({ name: 'location', type: 'varchar' })
  location: string;

  @Column({
    name: 'registered_in',
    type: 'enum',
    enum: RegisteredIn,
    default: RegisteredIn.UNREGISTERED,
  })
  registered_in: RegisteredIn;

  @Column({ name: 'model_year', type: 'int' })
  model_year: number;

  @Column({ name: 'price', type: 'float' })
  price: number;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @ManyToOne(() => User, (user) => user.cars, {
    cascade: false,
    onDelete: 'CASCADE',
  })
  owner: User;

  @OneToMany(() => Bid, (bid) => bid.car, {
    cascade: false,
    onDelete: 'CASCADE',
  })
  bids: Bid[];
}
