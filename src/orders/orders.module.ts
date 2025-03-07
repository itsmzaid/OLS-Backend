import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
// ✅ Import OrderItemsModule

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService], // ✅ Export if needed in other modules
})
export class OrdersModule {}
