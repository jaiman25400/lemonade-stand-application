import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeverageSize } from '../beverages/beverage-size.entity';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, BeverageSize])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
