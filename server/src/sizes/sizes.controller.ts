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
import { SizeResponseDto } from './dto/size-response.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { SizesService } from './sizes.service';

@ApiTags('sizes')
@Controller('sizes')
export class SizesController {
  constructor(private readonly sizesService: SizesService) {}

  @Get()
  @ApiOkResponse({ type: [SizeResponseDto] })
  findAll(): Promise<SizeResponseDto[]> {
    return this.sizesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: SizeResponseDto })
  @ApiNotFoundResponse()
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<SizeResponseDto> {
    return this.sizesService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: SizeResponseDto })
  create(@Body() dto: CreateSizeDto): Promise<SizeResponseDto> {
    return this.sizesService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: SizeResponseDto })
  @ApiNotFoundResponse()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSizeDto,
  ): Promise<SizeResponseDto> {
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
