import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  customerID: string;

  @IsString()
  @IsIn(['Male', 'Female'])
  gender: string;

  @IsNumber()
  @IsIn([0, 1])
  SeniorCitizen: number;

  @IsString()
  @IsIn(['Yes', 'No'])
  Partner: string;

  @IsString()
  @IsIn(['Yes', 'No'])
  Dependents: string;

  @IsNumber()
  tenure: number;

  @IsString()
  @IsIn(['Yes', 'No'])
  PhoneService: string;

  @IsString()
  @IsIn(['Yes', 'No', 'No phone service'])
  MultipleLines: string;

  @IsString()
  @IsIn(['DSL', 'Fiber optic', 'No'])
  InternetService: string;

  @IsString()
  @IsIn(['Yes', 'No', 'No internet service'])
  OnlineSecurity: string;

  @IsString()
  @IsIn(['Yes', 'No', 'No internet service'])
  OnlineBackup: string;

  @IsString()
  @IsIn(['Yes', 'No', 'No internet service'])
  DeviceProtection: string;

  @IsString()
  @IsIn(['Yes', 'No', 'No internet service'])
  TechSupport: string;

  @IsString()
  @IsIn(['Yes', 'No', 'No internet service'])
  StreamingTV: string;

  @IsString()
  @IsIn(['Yes', 'No', 'No internet service'])
  StreamingMovies: string;

  @IsString()
  @IsIn(['Month-to-month', 'One year', 'Two year'])
  Contract: string;

  @IsString()
  @IsIn(['Yes', 'No'])
  PaperlessBilling: string;

  @IsString()
  @IsIn(['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)'])
  PaymentMethod: string;

  @IsNumber()
  MonthlyCharges: number;

  @IsNumber()
  TotalCharges: number;

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
