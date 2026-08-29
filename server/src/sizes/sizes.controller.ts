import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { Size } from './size.entity';
import { SizesService } from './sizes.service';

@ApiTags('sizes')
@Controller('sizes')
export class SizesController {
  constructor(private readonly sizesService: SizesService) {}

  @Get()
  @ApiOkResponse({ type: [Size] })
  findAll(): Promise<Size[]> {
    return this.sizesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: Size })
  @ApiNotFoundResponse()
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Size> {
    return this.sizesService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: Size })
  create(@Body() dto: CreateSizeDto): Promise<Size> {
    return this.sizesService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: Size })
  @ApiNotFoundResponse()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSizeDto,
  ): Promise<Size> {
    return this.sizesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.sizesService.remove(id);
  }
}
