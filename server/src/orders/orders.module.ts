import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeverageSize } from '../beverages/beverage-size.entity.js';
import { OrderItem } from './order-item.entity.js';
import { Order } from './order.entity.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, BeverageSize])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
