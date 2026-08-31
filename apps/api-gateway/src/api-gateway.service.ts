import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { CreateRiderDto, CreateCoordinatesDTO } from '@app/rider-contracts';
import { handleRpcErrors } from './common/handle-rpc-errors';

@Injectable()
export class ApiGatewayService {
  private riderService: ClientProxy;
  private coordinateRiderService: ClientProxy;

  constructor() {
    const rabbitmqUrl =
      process.env.RABBITMQ_URL ?? 'amqp://user:password@localhost:5673';
    this.riderService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'rider_queue',
        queueOptions: {
          durable: false,
        },
      },
    });
    this.coordinateRiderService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'coordinate_rider_queue',
        queueOptions: {
          durable: false,
        },
      },
    });
  }

  getRiderById(payload: string) {
    return this.riderService
      .send({ cmd: 'get-rider' }, { id: parseInt(payload, 10) })
      .pipe(handleRpcErrors);
  }

  getAllRiders() {
    return this.riderService
      .send({ cmd: 'get-all-riders' }, {})
      .pipe(handleRpcErrors);
  }

  createRider(createRiderDto: CreateRiderDto) {
    return this.riderService
      .send({ cmd: 'create-rider' }, createRiderDto)
      .pipe(handleRpcErrors);
  }

  createCoordinateRider(coordinateRiderDto: CreateCoordinatesDTO) {
    return this.coordinateRiderService
      .send({ cmd: 'create-coordinate-rider' }, coordinateRiderDto)
      .pipe(handleRpcErrors);
  }

  getRiderCoordinates(payload: string) {
    return this.coordinateRiderService
      .send({ cmd: 'get-rider-coordinates' }, { id: parseInt(payload, 10) })
      .pipe(handleRpcErrors);
  }
}
