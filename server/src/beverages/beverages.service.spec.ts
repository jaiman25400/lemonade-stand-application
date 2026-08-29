import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Size } from '../sizes/size.entity';
import { BeverageSize } from './beverage-size.entity';
import { Beverage } from './beverage.entity';
import { BeveragesService } from './beverages.service';

describe('BeveragesService', () => {
  const beveragesRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
  const beverageSizesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };
  const sizesRepository = { findOne: jest.fn() };

  let service: BeveragesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeveragesService,
        {
          provide: getRepositoryToken(Beverage),
          useValue: beveragesRepository,
        },
        {
          provide: getRepositoryToken(BeverageSize),
          useValue: beverageSizesRepository,
        },
        { provide: getRepositoryToken(Size), useValue: sizesRepository },
      ],
    }).compile();

    service = module.get(BeveragesService);
  });

  it('returns an empty list when the table has no rows', async () => {
    beveragesRepository.find.mockResolvedValue([]);

    await expect(service.findAll()).resolves.toEqual([]);
  });

  it('maps a saved beverage to a response with sizes', async () => {
    const saved = {
      id: 'uuid',
      name: 'Classic Lemonade',
      beverageSizes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    beveragesRepository.create.mockReturnValue(saved);
    beveragesRepository.save.mockResolvedValue(saved);
    beveragesRepository.findOne.mockResolvedValue(saved);

    const result = await service.create({ name: 'Classic Lemonade' });

    expect(result).toEqual(
      expect.objectContaining({
        id: 'uuid',
        name: 'Classic Lemonade',
        sizes: [],
      }),
    );
  });

  it('throws NotFoundException when the id does not exist', async () => {
    beveragesRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
