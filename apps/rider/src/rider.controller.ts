import { Controller, Param, Body, Put } from '@nestjs/common';
import { RiderService } from './rider.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateRiderDto } from '@app/rider-contracts';
import { Rider } from './rider.entity';

@Controller('rider')
export class RiderController {
  constructor(private readonly riderService: RiderService) {}

  @MessagePattern({ cmd: 'get-rider' })
  async getRiderById(
    @Payload()
    data: {
      id: string;
    },
  ): Promise<Rider> {
    const { id } = data;
    return await this.riderService.getRiderById(id);
  }

  @MessagePattern({ cmd: 'create-rider' })
  async createRider(@Payload() riderData: CreateRiderDto): Promise<Rider> {
    return await this.riderService.createRider(riderData);
  }

  @MessagePattern({ cmd: 'update-rider' })
  @Put(':id')
  async updateRider(
    @Param('id') riderId: string,
    @Body() riderData: Partial<Rider>,
  ): Promise<Rider> {
    return await this.riderService.updateRider(riderId, riderData);
  }

  @MessagePattern({ cmd: 'get-all-riders' })
  async getAllRiders(): Promise<Rider[]> {
    return await this.riderService.findAll();
  }

  @MessagePattern({ cmd: 'delete-rider' })
  async deleteRider(@Param('id') riderId: string): Promise<void> {
    return await this.riderService.deleteRider(riderId);
  }
}
