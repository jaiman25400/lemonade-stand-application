import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Beverage } from './beverage.entity';
import { Size } from '../sizes/size.entity';

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

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value.toFixed(2),
      from: (value: string) => Number(value),
    },
  })
  price!: number;
}
