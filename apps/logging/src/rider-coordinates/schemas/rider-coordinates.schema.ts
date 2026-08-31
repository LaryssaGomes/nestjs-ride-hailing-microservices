import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type RiderCoordinatesDocument = HydratedDocument<RiderCoordinates>;

@Schema()
export class RiderCoordinates {
  @Prop({ required: true })
  lat?: number;

  @Prop({ required: true })
  lng?: number;

  @Prop({ required: true })
  timestamp?: Date;

  @Prop({ required: true })
  riderId?: string;
}

export const RiderCoordinatesSchema =
  SchemaFactory.createForClass(RiderCoordinates);
