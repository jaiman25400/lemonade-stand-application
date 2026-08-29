import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Size } from './size.entity';
import { SizesService } from './sizes.service';

describe('SizesService', () => {
  it('returns an empty list when there are no sizes', async () => {
    const find = jest.fn().mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SizesService,
        { provide: getRepositoryToken(Size), useValue: { find } },
      ],
    }).compile();

    await expect(module.get(SizesService).findAll()).resolves.toEqual([]);
  });
});
