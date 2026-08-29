import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUniqueViolation } from '../common/database/postgres-error';
import { Size } from '../sizes/size.entity';
import { BeverageSize } from './beverage-size.entity';
import { toBeverageResponse } from './beverage.mapper';
import { Beverage } from './beverage.entity';
import { AddBeverageSizeDto } from './dto/add-beverage-size.dto';
import { BeverageResponseDto } from './dto/beverage-response.dto';
import { CreateBeverageDto } from './dto/create-beverage.dto';
import { UpdateBeverageDto } from './dto/update-beverage.dto';
import { UpdateBeverageSizePriceDto } from './dto/update-beverage-size-price.dto';

const beverageRelations = {
  beverageSizes: { size: true },
} as const;

@Injectable()
export class BeveragesService {
  constructor(
    @InjectRepository(Beverage)
    private readonly beveragesRepository: Repository<Beverage>,
    @InjectRepository(BeverageSize)
    private readonly beverageSizesRepository: Repository<BeverageSize>,
    @InjectRepository(Size)
    private readonly sizesRepository: Repository<Size>,
  ) {}

  async findAll(): Promise<BeverageResponseDto[]> {
    const beverages = await this.beveragesRepository.find({
      relations: beverageRelations,
      order: { name: 'ASC' },
    });

    return beverages.map(toBeverageResponse);
  }

  async findOne(id: string): Promise<BeverageResponseDto> {
    return toBeverageResponse(await this.findBeverageOrFail(id));
  }

  async create(dto: CreateBeverageDto): Promise<BeverageResponseDto> {
    const beverage = this.beveragesRepository.create({ name: dto.name });

    try {
      const saved = await this.beveragesRepository.save(beverage);
      return this.findOne(saved.id);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('A beverage with this name already exists');
      }
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateBeverageDto,
  ): Promise<BeverageResponseDto> {
    const beverage = await this.findBeverageOrFail(id);
    Object.assign(beverage, dto);

    try {
      await this.beveragesRepository.save(beverage);
      return this.findOne(id);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('A beverage with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const beverage = await this.findBeverageOrFail(id);
    await this.beveragesRepository.remove(beverage);
  }

  async addSize(
    beverageId: string,
    dto: AddBeverageSizeDto,
  ): Promise<BeverageResponseDto> {
    const beverage = await this.findBeverageOrFail(beverageId);
    const size = await this.sizesRepository.findOne({
      where: { id: dto.sizeId },
    });

    if (!size) {
      throw new NotFoundException(`Size ${dto.sizeId} was not found`);
    }

    const row = this.beverageSizesRepository.create({
      beverage,
      size,
      price: dto.price,
    });

    try {
      await this.beverageSizesRepository.save(row);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'This size is already linked to the beverage',
        );
      }
      throw error;
    }

    return this.findOne(beverageId);
  }

  async updateSizePrice(
    beverageId: string,
    sizeId: string,
    dto: UpdateBeverageSizePriceDto,
  ): Promise<BeverageResponseDto> {
    const row = await this.findOfferingOrFail(beverageId, sizeId);
    row.price = dto.price;
    await this.beverageSizesRepository.save(row);
    return this.findOne(beverageId);
  }

  async removeSize(beverageId: string, sizeId: string): Promise<void> {
    const row = await this.findOfferingOrFail(beverageId, sizeId);
    await this.beverageSizesRepository.remove(row);
  }

  private async findBeverageOrFail(id: string): Promise<Beverage> {
    const beverage = await this.beveragesRepository.findOne({
      where: { id },
      relations: beverageRelations,
    });

    if (!beverage) {
      throw new NotFoundException(`Beverage ${id} was not found`);
    }

    return beverage;
  }

  private async findOfferingOrFail(
    beverageId: string,
    sizeId: string,
  ): Promise<BeverageSize> {
    await this.findBeverageOrFail(beverageId);

    const row = await this.beverageSizesRepository.findOne({
      where: { beverage: { id: beverageId }, size: { id: sizeId } },
      relations: { size: true, beverage: true },
    });

    if (!row) {
      throw new NotFoundException(
        `Size ${sizeId} is not linked to beverage ${beverageId}`,
      );
    }

    return row;
  }
}
