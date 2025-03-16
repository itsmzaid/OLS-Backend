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

  @Get('pending')
  async getPendingOrder(@Request() req) {
    return this.ordersService.getPendingOrder(req.user.uid);
  }

  @Patch(':orderId/status')
  async updateOrderStatus(
    @Request() req,
    @Param('orderId') orderId: string,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateOrderStatus(req.user.uid, orderId, status);
  }

  @Get()
  async getUserOrders(@Request() req) {
    return this.ordersService.getUserOrders(req.user.uid);
  }

  @Get(':orderId')
  async getOrderById(@Request() req, @Param('orderId') orderId: string) {
    return this.ordersService.getOrderById(req.user.uid, orderId);
  }

  @Get('status/:status')
  async getOrdersByStatus(@Request() req, @Param('status') status: string) {
    return this.ordersService.getOrdersByStatus(req.user.uid, status);
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
