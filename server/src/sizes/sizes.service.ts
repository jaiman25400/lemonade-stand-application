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
import { UpdateSizeDto } from './dto/update-size.dto';
import { Size } from './size.entity';

@Injectable()
export class SizesService {
  constructor(
    @InjectRepository(Size)
    private readonly sizesRepository: Repository<Size>,
  ) {}

  findAll(): Promise<Size[]> {
    return this.sizesRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Size> {
    const size = await this.sizesRepository.findOne({ where: { id } });

    if (!size) {
      throw new NotFoundException(`Size ${id} was not found`);
    }

    return size;
  }

  async create(dto: CreateSizeDto): Promise<Size> {
    const size = this.sizesRepository.create({ name: dto.name });

    try {
      return await this.sizesRepository.save(size);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('A size with this name already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateSizeDto): Promise<Size> {
    const size = await this.findOne(id);
    Object.assign(size, dto);

    try {
      return await this.sizesRepository.save(size);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('A size with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const size = await this.findOne(id);

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
}
