import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { moneyColumn } from '../common/database/money.column';
import type { OrderItem } from './order-item.entity';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 16, unique: true })
  confirmationNumber!: string;

  @Column({ type: 'varchar', length: 120 })
  customerName!: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  customerPhone!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  customerEmail!: string | null;

  @Column(moneyColumn)
  total!: number;

  @OneToMany('OrderItem', (item: OrderItem) => item.order, { cascade: true })
  items!: OrderItem[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
