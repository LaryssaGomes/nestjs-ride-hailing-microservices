import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rider } from './rider.entity';
import { Repository } from 'typeorm';
import { CreateRiderDto } from '@app/rider-contracts';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class RiderService {
  constructor(
    @InjectRepository(Rider)
    private readonly riderRepository: Repository<Rider>,
  ) {}

  async getRiderById(riderId: string): Promise<Rider> {
    const rider = await this.riderRepository.findOne({
      where: { id: parseInt(riderId) },
    });
    if (!rider) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Rider with ID ${riderId} not found`,
      });
    }
    return rider;
  }

  findAll(): Promise<Rider[]> {
    return this.riderRepository.find();
  }

  createRider(riderData: CreateRiderDto): Promise<Rider> {
    const newRider = this.riderRepository.create(riderData);
    return this.riderRepository.save(newRider);
  }

  updateRider(riderId: string, riderData: Partial<Rider>): Promise<Rider> {
    return this.riderRepository
      .findOne({ where: { id: parseInt(riderId) } })
      .then((rider) => {
        if (!rider) {
          throw new RpcException({
            statusCode: HttpStatus.NOT_FOUND,
            message: `Rider with ID ${riderId} not found`,
          });
        }
        Object.assign(rider, riderData);
        return this.riderRepository.save(rider);
      });
  }

  deleteRider(riderId: string): Promise<void> {
    return this.riderRepository
      .findOne({ where: { id: parseInt(riderId) } })
      .then((rider) => {
        if (!rider) {
          throw new RpcException({
            statusCode: HttpStatus.NOT_FOUND,
            message: `Rider with ID ${riderId} not found`,
          });
        }
        return this.riderRepository.remove(rider).then(() => undefined);
      });
  }
}
