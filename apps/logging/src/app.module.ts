import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RiderCoordinatesModule } from './rider-coordinates/rider-coordinates.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI ??
        'mongodb://root:root@localhost:27018/logging-db?authSource=admin',
    ),
    RiderCoordinatesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
