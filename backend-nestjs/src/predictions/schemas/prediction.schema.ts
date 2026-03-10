import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Prediction extends Document {
  @Prop({ required: true, index: true })
  customerId: string;

  @Prop()
  customerName: string;

  @Prop({ required: true })
  churnProbability: number;

  @Prop({ required: true, enum: ['HIGH', 'MEDIUM', 'LOW'], index: true })
  riskLevel: string;

  @Prop({ index: true })
  recommendation: string;

  @Prop({ enum: ['URGENT', 'HIGH', 'NORMAL', 'LOW'], index: true })
  priority: string;

  // Reason codes explaining why recommendation was given
  @Prop({ type: [String] })
  reasonCodes?: string[];

  // DSS Explainability - Top factors influencing prediction
  @Prop({ type: [{ feature: String, value: String, impact: Number }] })
  topFactors?: Array<{ feature: string; value: string | number; impact: number }>;

  // Input snapshot for auditability
  @Prop({ type: Object, required: true })
  inputSnapshot: Record<string, any>;

  @Prop({ type: Object })
  inputData: Record<string, any>;

  @Prop({ enum: ['pending', 'success', 'failed'], default: 'success', index: true })
  status: string;

  @Prop()
  errorMessage: string;

  @Prop({ type: Date, expires: 7776000 })
  expiresAt: Date;

  @Prop()
  modelVersion: string;

  @Prop()
  predictionMethod: string; // 'customer_based' | 'raw_input'
}

export const PredictionSchema = SchemaFactory.createForClass(Prediction);

// Create indexes for efficient querying
PredictionSchema.index({ customerId: 1, createdAt: -1 }); // Query predictions for a customer
PredictionSchema.index({ riskLevel: 1, createdAt: -1 }); // Query by risk level
PredictionSchema.index({ createdAt: -1 }); // Timeline queries
PredictionSchema.index({ status: 1 }); // Filter by status
