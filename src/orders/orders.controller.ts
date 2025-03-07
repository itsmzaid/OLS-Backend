import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '../guards/auth.guard';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.uid, createOrderDto);
  }

  @Get()
  async getUserOrders(@Request() req) {
    return this.ordersService.getUserOrders(req.user.uid);
  }

  @Get(':orderId')
  async getOrderById(@Request() req, @Param('orderId') orderId: string) {
    return this.ordersService.getOrderById(req.user.uid, orderId);
  }

  @Patch(':orderId')
  async updateOrder(
    @Request() req,
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.updateOrder(
      req.user.uid,
      orderId,
      updateOrderDto,
    );
  }

  @Delete(':orderId')
  async deleteOrder(@Request() req, @Param('orderId') orderId: string) {
    return this.ordersService.deleteOrder(req.user.uid, orderId);
  }
}
