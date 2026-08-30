import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { moneyColumn } from '../common/database/money.column';
import { Order } from './order.entity';

@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ type: 'varchar', length: 120 })
  beverageName!: string;

  @Column({ type: 'varchar', length: 40 })
  sizeName!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column(moneyColumn)
  unitPrice!: number;

  @Column(moneyColumn)
  lineTotal!: number;
}
