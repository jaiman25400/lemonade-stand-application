import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { moneyColumn } from '../common/database/money.column';
import { Size } from '../sizes/size.entity';
import { Beverage } from './beverage.entity';

@Entity({ name: 'beverage_sizes' })
@Unique('UQ_beverage_sizes_beverage_size', ['beverage', 'size'])
export class BeverageSize {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Beverage, (beverage) => beverage.beverageSizes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'beverage_id' })
  beverage!: Beverage;

  @ManyToOne(() => Size, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'size_id' })
  size!: Size;

  @Column(moneyColumn)
  price!: number;
}
