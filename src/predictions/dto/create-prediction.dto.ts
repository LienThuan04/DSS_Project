import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreatePredictionDto {
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsObject()
  inputData: Record<string, any>;
}

export class MakePredictionDto {
  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsNumber()
  SeniorCitizen?: number;

  @IsOptional()
  @IsString()
  Partner?: string;

  @IsOptional()
  @IsString()
  Dependents?: string;

  @IsOptional()
  @IsNumber()
  tenure?: number;

  @IsOptional()
  @IsString()
  PhoneService?: string;

  @IsOptional()
  @IsString()
  MultipleLines?: string;

  @IsOptional()
  @IsString()
  InternetService?: string;

  @IsOptional()
  @IsString()
  OnlineSecurity?: string;

  @IsOptional()
  @IsString()
  OnlineBackup?: string;

  @IsOptional()
  @IsString()
  DeviceProtection?: string;

  @IsOptional()
  @IsString()
  TechSupport?: string;

  @IsOptional()
  @IsString()
  StreamingTV?: string;

  @IsOptional()
  @IsString()
  StreamingMovies?: string;

  @IsOptional()
  @IsString()
  Contract?: string;

  @IsOptional()
  @IsString()
  PaperlessBilling?: string;

  @IsOptional()
  @IsString()
  PaymentMethod?: string;

  @IsOptional()
  @IsNumber()
  MonthlyCharges?: number;

  @IsOptional()
  @IsNumber()
  TotalCharges?: number;

  [key: string]: any;
}
