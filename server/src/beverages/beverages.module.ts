import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Size } from '../sizes/size.entity';
import { BeverageSize } from './beverage-size.entity';
import { Beverage } from './beverage.entity';
import { BeveragesController } from './beverages.controller';
import { BeveragesService } from './beverages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Beverage, BeverageSize, Size])],
  controllers: [BeveragesController],
  providers: [BeveragesService],
})
export class BeveragesModule {}
