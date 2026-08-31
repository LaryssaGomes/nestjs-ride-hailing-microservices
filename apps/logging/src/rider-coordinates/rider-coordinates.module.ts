import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RiderCoordinatesController } from './rider-coordinates.controller';
import { RiderCoordinatesService } from './rider-coordinates.service';
import {
  RiderCoordinates,
  RiderCoordinatesSchema,
} from './schemas/rider-coordinates.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RiderCoordinates.name, schema: RiderCoordinatesSchema },
    ]),
    ClientsModule.register([
      {
        name: 'RIDER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ?? 'amqp://user:password@localhost:5673',
          ],
          queue: 'rider_coordinates_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [RiderCoordinatesController],
  providers: [RiderCoordinatesService],
})
export class RiderCoordinatesModule {}
