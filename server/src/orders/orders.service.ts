import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BeverageSize } from '../beverages/beverage-size.entity.js';
import { isUniqueViolation } from '../common/database/postgres-error.js';
import { fromCents, toCents } from '../common/money.js';
import { createConfirmationNumber } from './confirmation-number.js';
import { CreateOrderDto, CreateOrderItemDto } from './dto/create-order.dto.js';
import { OrderResponseDto } from './dto/order-response.dto.js';
import { OrderItem } from './order-item.entity.js';
import { Order } from './order.entity.js';
import { toOrderResponse } from './order.mapper.js';

const CONFIRMATION_ATTEMPTS = 3;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(BeverageSize)
    private readonly beverageSizesRepository: Repository<BeverageSize>,
  ) {}

  async create(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const mergedItems = this.mergeItems(dto.items);
    const items: OrderItem[] = [];
    let totalCents = 0;

    for (const item of mergedItems) {
      const offering = await this.beverageSizesRepository.findOne({
        where: {
          beverage: { id: item.beverageId },
          size: { id: item.sizeId },
        },
        relations: { beverage: true, size: true },
      });

      if (!offering) {
        throw new BadRequestException(
          'One or more items are not available in the selected size',
        );
      }

      const unitCents = toCents(Number(offering.price));
      const lineCents = unitCents * item.quantity;
      totalCents += lineCents;

      items.push(
        this.orderItemsRepository.create({
          beverageName: offering.beverage.name,
          sizeName: offering.size.name,
          quantity: item.quantity,
          unitPrice: fromCents(unitCents),
          lineTotal: fromCents(lineCents),
        }),
      );
    }

    for (let attempt = 1; attempt <= CONFIRMATION_ATTEMPTS; attempt += 1) {
      const order = this.ordersRepository.create({
        confirmationNumber: createConfirmationNumber(),
        customerName: dto.customerName.trim(),
        customerPhone: dto.phone?.trim() ?? null,
        customerEmail: dto.email?.trim() ?? null,
        total: fromCents(totalCents),
        items: items.map((item) =>
          this.orderItemsRepository.create({
            beverageName: item.beverageName,
            sizeName: item.sizeName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          }),
        ),
      });

      try {
        const saved = await this.ordersRepository.save(order);
        return this.findByConfirmationNumber(saved.confirmationNumber);
      } catch (error) {
        if (!isUniqueViolation(error) || attempt === CONFIRMATION_ATTEMPTS) {
          throw error;
        }
      }
    }

    throw new InternalServerErrorException(
      'Could not allocate a confirmation number',
    );
  }

  async findByConfirmationNumber(
    confirmationNumber: string,
  ): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: { confirmationNumber: confirmationNumber.toUpperCase() },
      relations: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order ${confirmationNumber} was not found`);
    }

    return toOrderResponse(order);
  }

  private mergeItems(items: CreateOrderItemDto[]): CreateOrderItemDto[] {
    const merged = new Map<string, CreateOrderItemDto>();

    for (const item of items) {
      const key = `${item.beverageId}:${item.sizeId}`;
      const existing = merged.get(key);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        merged.set(key, { ...item });
      }
    }

    return [...merged.values()];
  }
}
