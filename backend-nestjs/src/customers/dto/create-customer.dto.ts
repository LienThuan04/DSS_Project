import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  customerID: string;

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

  @IsOptional()
  @IsString()
  Churn?: string;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  customerID?: string;

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
  InternetService?: string;

  @IsOptional()
  @IsString()
  Contract?: string;

  @IsOptional()
  @IsString()
  PaymentMethod?: string;

  @IsOptional()
  @IsNumber()
  MonthlyCharges?: number;

  @IsOptional()
  @IsNumber()
  TotalCharges?: number;

  @IsOptional()
  @IsString()
  Churn?: string;
}
