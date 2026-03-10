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
  @IsNumber()
  tenure?: number;

  @IsOptional()
  @IsNumber()
  MonthlyCharges?: number;

  @IsOptional()
  @IsNumber()
  TotalCharges?: number;

  @IsOptional()
  @IsNumber()
  SeniorCitizen?: number;

  @IsOptional()
  @IsNumber()
  Contract?: number;

  @IsOptional()
  @IsNumber()
  InternetService?: number;

  @IsOptional()
  @IsNumber()
  PaymentMethod?: number;

  [key: string]: any;
}
