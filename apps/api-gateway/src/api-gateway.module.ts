import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AuthService } from './auth.service';

@Module({
  imports: [],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService, AuthService],
})
export class ApiGatewayModule {}
