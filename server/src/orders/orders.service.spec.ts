import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BeverageSize } from '../beverages/beverage-size.entity.js';
import { OrderItem } from './order-item.entity.js';
import { Order } from './order.entity.js';
import { OrdersService } from './orders.service.js';

describe('OrdersService', () => {
  const ordersRepository = {
    create: jest.fn((value: unknown) => value),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  const orderItemsRepository = {
    create: jest.fn((value: unknown) => value),
  };
  const beverageSizesRepository = {
    findOne: jest.fn(),
  };

  let service: OrdersService;

  function persistOrder() {
    ordersRepository.save.mockImplementation((order: Order) => {
      const saved = {
        ...order,
        createdAt: new Date(),
      };
      ordersRepository.findOne.mockResolvedValue(saved);
      return Promise.resolve(saved);
    });
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: ordersRepository },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: orderItemsRepository,
        },
        {
          provide: getRepositoryToken(BeverageSize),
          useValue: beverageSizesRepository,
        },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  it('calculates the total from catalog prices, not the client', async () => {
    beverageSizesRepository.findOne.mockResolvedValue({
      price: 2,
      beverage: { name: 'Classic Lemonade' },
      size: { name: 'Small' },
    });
    persistOrder();

    const result = await service.create({
      customerName: 'Ada',
      email: 'ada@example.com',
      items: [
        {
          beverageId: 'bev-1',
          sizeId: 'size-1',
          quantity: 3,
        },
      ],
    });

    expect(result.total).toBe(6);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        beverageName: 'Classic Lemonade',
        sizeName: 'Small',
        quantity: 3,
        unitPrice: 2,
        lineTotal: 6,
      }),
    );
    expect(result.confirmationNumber).toMatch(/^LS-[A-F0-9]{8}$/);
  });

  it('merges duplicate beverage and size lines before pricing', async () => {
    beverageSizesRepository.findOne.mockResolvedValue({
      price: 2,
      beverage: { name: 'Classic Lemonade' },
      size: { name: 'Small' },
    });
    persistOrder();

    const result = await service.create({
      customerName: 'Ada',
      phone: '4165550100',
      items: [
        { beverageId: 'bev-1', sizeId: 'size-1', quantity: 1 },
        { beverageId: 'bev-1', sizeId: 'size-1', quantity: 2 },
      ],
    });

    expect(beverageSizesRepository.findOne).toHaveBeenCalledTimes(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].quantity).toBe(3);
    expect(result.total).toBe(6);
  });

  it('rejects items that are not on the menu', async () => {
    beverageSizesRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        customerName: 'Ada',
        phone: '4165550100',
        items: [{ beverageId: 'bev-1', sizeId: 'size-1', quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
