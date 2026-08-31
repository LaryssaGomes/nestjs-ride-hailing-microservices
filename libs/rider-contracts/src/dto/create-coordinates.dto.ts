import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCoordinatesDTO {
  @IsNumber()
  @IsNotEmpty()
  lng?: number;

  @IsNumber()
  @IsNotEmpty()
  lat?: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  timestamp?: Date;

  @IsNotEmpty()
  riderId?: string;
}
