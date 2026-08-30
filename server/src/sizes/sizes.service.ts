import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from '../common/database/postgres-error';
import { CreateSizeDto } from './dto/create-size.dto';
import { SizeResponseDto } from './dto/size-response.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { Size } from './size.entity';
import { toSizeResponse } from './size.mapper';

@Injectable()
export class SizesService {
  constructor(
    @InjectRepository(Size)
    private readonly sizesRepository: Repository<Size>,
  ) {}

  async findAll(): Promise<SizeResponseDto[]> {
    const sizes = await this.sizesRepository.find({ order: { name: 'ASC' } });

    return sizes.map(toSizeResponse);
  }

  async findOne(id: string): Promise<SizeResponseDto> {
    return toSizeResponse(await this.findSizeOrFail(id));
  }

  async create(dto: CreateSizeDto): Promise<SizeResponseDto> {
    const size = this.sizesRepository.create({ name: dto.name });

    try {
      return toSizeResponse(await this.sizesRepository.save(size));
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('A size with this name already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateSizeDto): Promise<SizeResponseDto> {
    const size = await this.findSizeOrFail(id);
    Object.assign(size, dto);

    try {
      return toSizeResponse(await this.sizesRepository.save(size));
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('A size with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const size = await this.findSizeOrFail(id);

    try {
      await this.sizesRepository.remove(size);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException(
          'Cannot delete a size that is assigned to a beverage',
        );
      }
      throw error;
    }
  }

  private async findSizeOrFail(id: string): Promise<Size> {
    const size = await this.sizesRepository.findOne({ where: { id } });

    if (!size) {
      throw new NotFoundException(`Size ${id} was not found`);
    }

    return size;
  }
}
