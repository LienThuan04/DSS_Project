import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Customer extends Document {
  @Prop()
  customerID: string;

  @Prop()
  gender: string;

  @Prop()
  SeniorCitizen: number;

  @Prop()
  Partner: string;

  @Prop()
  Dependents: string;

  @Prop()
  tenure: number;

  @Prop()
  PhoneService: string;

  @Prop()
  MultipleLines: string;

  @Prop()
  InternetService: string;

  @Prop()
  OnlineSecurity: string;

  @Prop()
  OnlineBackup: string;

  @Prop()
  DeviceProtection: string;

  @Prop()
  TechSupport: string;

  @Prop()
  StreamingTV: string;

  @Prop()
  StreamingMovies: string;

  @Prop()
  Contract: string;

  @Prop()
  PaperlessBilling: string;

  @Prop()
  PaymentMethod: string;

  @Prop()
  MonthlyCharges: number;

  @Prop()
  TotalCharges: number;

  @Prop()
  Churn: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Create indexes for common queries and performance
CustomerSchema.index({ customerID: 1 }, { unique: true });
CustomerSchema.index({ tenure: 1 });
CustomerSchema.index({ MonthlyCharges: 1 });
CustomerSchema.index({ Contract: 1 });
CustomerSchema.index({ InternetService: 1 });
CustomerSchema.index({ PaymentMethod: 1 });
CustomerSchema.index({ Churn: 1 });
