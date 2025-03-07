import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Items') // Swagger group
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  // ✅ Create item (Ensures DTO validation)
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({ status: 201, description: 'Item successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid service name' })
  async create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.createItem(createItemDto);
  }

  // ✅ Get all items (Includes serviceName automatically)
  @Get()
  @ApiOperation({ summary: 'Get all items' })
  @ApiResponse({ status: 200, description: 'Returns list of items' })
  async getAllItems() {
    return this.itemsService.getAllItems();
  }
  // ✅ Get items by service name
  @Get('service/:serviceName')
  async getItemsByService(@Param('serviceName') serviceName: string) {
    return this.itemsService.getItemsByService(serviceName);
  }

  // ✅ Get single item by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a single item by ID' })
  @ApiParam({ name: 'id', example: 'abc123', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Item details' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async getItemById(@Param('id') id: string) {
    return this.itemsService.getItemById(id);
  }

  // ✅ Update item (Handles serviceName update properly)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing item' })
  @ApiParam({ name: 'id', example: 'abc123', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Item updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid service name' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) updateItemDto: UpdateItemDto,
  ) {
    return this.itemsService.updateItem(id, updateItemDto);
  }

  // ✅ Delete item by ID
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an item by ID' })
  @ApiParam({ name: 'id', example: 'abc123', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async delete(@Param('id') id: string) {
    return this.itemsService.deleteItem(id);
  }
}
