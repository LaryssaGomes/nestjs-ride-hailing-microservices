import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiderController } from './rider.controller';
import { RiderService } from './rider.service';
import { Rider } from './rider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rider])],
  controllers: [RiderController],
  providers: [RiderService],
})
export class RiderModule {}
