import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [ConfigModule.forRoot(), UserModule],
  providers: [AuthGuard],
})
export class AppModule {}
