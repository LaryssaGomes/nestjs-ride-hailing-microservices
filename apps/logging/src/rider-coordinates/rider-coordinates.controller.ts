import { Body, Controller } from '@nestjs/common';
import { CreateCoordinatesDTO } from '@app/rider-contracts';
import { RiderCoordinatesService } from './rider-coordinates.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('rider-coordinates')
export class RiderCoordinatesController {
  constructor(private coordinatesService: RiderCoordinatesService) {}
  @MessagePattern({ cmd: 'get-rider-coordinates' })
  getRiderCoordinates(data: { id: string }) {
    return this.coordinatesService.getRiderCoordinates(data.id);
  }
  @MessagePattern({ cmd: 'create-coordinate-rider' })
  async saveRiderCoordinates(createCoordinateDTO: CreateCoordinatesDTO) {
    return this.coordinatesService.saveRiderCoordinates(createCoordinateDTO);
  }
}
