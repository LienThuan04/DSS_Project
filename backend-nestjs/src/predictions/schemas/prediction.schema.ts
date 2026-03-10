import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Prediction extends Document {
  @Prop({ required: true })
  customerId: string;

  @Prop()
  customerName: string;

  @Prop({ required: true })
  churnProbability: number;

  @Prop({ required: true, enum: ['HIGH', 'MEDIUM', 'LOW'] })
  riskLevel: string;

  @Prop()
  recommendation: string;

  @Prop({ enum: ['URGENT', 'HIGH', 'NORMAL'] })
  priority: string;

  @Prop({ type: Object })
  inputData: Record<string, any>;

  @Prop({ enum: ['pending', 'success', 'failed'], default: 'success' })
  status: string;

  @Prop()
  errorMessage: string;

  @Prop({ type: Date, expires: 7776000 })
  expiresAt: Date;
}

export const PredictionSchema = SchemaFactory.createForClass(Prediction);
PredictionSchema.index({ status: 1, riskLevel: 1 });
PredictionSchema.index({ createdAt: -1 });
