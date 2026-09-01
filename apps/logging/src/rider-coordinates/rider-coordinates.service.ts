import { Inject, Injectable } from '@nestjs/common';
import { CreateCoordinatesDTO } from '@app/rider-contracts';
import { InjectModel } from '@nestjs/mongoose';
import { RiderCoordinates } from './schemas/rider-coordinates.schema';
import { Model } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RiderCoordinatesService {
  constructor(
    @InjectModel(RiderCoordinates.name)
    private readonly riderCoodinateModel: Model<RiderCoordinates>,
    @Inject('RIDER_SERVICE')
    private readonly client: ClientProxy,
  ) {}
  async saveRiderCoordinates(createCoordinateDTO: CreateCoordinatesDTO) {
    return await this.riderCoodinateModel.create(createCoordinateDTO);
  }
  async getRiderCoordinates(
    riderId?: string,
  ): Promise<{ coordinates: RiderCoordinates[]; riders: unknown }> {
    const coordinates = await this.riderCoodinateModel.find({ riderId });
    const pattern = { cmd: 'get-rider' };
    const payload = { id: riderId };
    const riders = (await firstValueFrom(
      this.client.send(pattern, payload),
    )) as unknown;
    return { coordinates, riders };
  }
}
