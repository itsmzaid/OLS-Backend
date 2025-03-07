import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';
import { ServicesModule } from './services/services.module';
import { ItemsModule } from './items/items.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    ServicesModule,
    ItemsModule,
    OrdersModule,
  ],
  providers: [AuthGuard],
})
export class AppModule {}
