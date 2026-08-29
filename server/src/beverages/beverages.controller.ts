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
import { BeveragesService } from './beverages.service';
import { AddBeverageSizeDto } from './dto/add-beverage-size.dto';
import { BeverageResponseDto } from './dto/beverage-response.dto';
import { CreateBeverageDto } from './dto/create-beverage.dto';
import { UpdateBeverageDto } from './dto/update-beverage.dto';
import { UpdateBeverageSizePriceDto } from './dto/update-beverage-size-price.dto';

@ApiTags('beverages')
@Controller('beverages')
export class BeveragesController {
  constructor(private readonly beveragesService: BeveragesService) {}

  @Get()
  @ApiOkResponse({ type: [BeverageResponseDto] })
  findAll(): Promise<BeverageResponseDto[]> {
    return this.beveragesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: BeverageResponseDto })
  @ApiNotFoundResponse()
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BeverageResponseDto> {
    return this.beveragesService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: BeverageResponseDto })
  create(@Body() dto: CreateBeverageDto): Promise<BeverageResponseDto> {
    return this.beveragesService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: BeverageResponseDto })
  @ApiNotFoundResponse()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBeverageDto,
  ): Promise<BeverageResponseDto> {
    return this.beveragesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.beveragesService.remove(id);
  }

  @Post(':id/sizes')
  @ApiCreatedResponse({ type: BeverageResponseDto })
  addSize(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddBeverageSizeDto,
  ): Promise<BeverageResponseDto> {
    return this.beveragesService.addSize(id, dto);
  }

  @Patch(':id/sizes/:sizeId')
  @ApiOkResponse({ type: BeverageResponseDto })
  updateSizePrice(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('sizeId', ParseUUIDPipe) sizeId: string,
    @Body() dto: UpdateBeverageSizePriceDto,
  ): Promise<BeverageResponseDto> {
    return this.beveragesService.updateSizePrice(id, sizeId, dto);
  }

  @Delete(':id/sizes/:sizeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  removeSize(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('sizeId', ParseUUIDPipe) sizeId: string,
  ): Promise<void> {
    return this.beveragesService.removeSize(id, sizeId);
  }
}
