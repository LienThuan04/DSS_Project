import { IsNumber, IsString, IsArray, IsEnum, IsOptional, IsObject } from 'class-validator';

/**
 * DSS Output Enum: Priority Levels
 * LOW: Standard monitoring, minimal intervention
 * NORMAL: Routine retention actions
 * HIGH: Important opportunity for retention
 * URGENT: Immediate intervention required
 */
export enum PriorityLevel {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * DSS Output Enum: Risk Levels
 * LOW: Churn probability < 0.33 (low risk)
 * MEDIUM: Churn probability 0.33-0.67 (moderate risk)
 * HIGH: Churn probability > 0.67 (high risk)
 */
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

/**
 * Single factor explanation (top factors influencing prediction)
 */
export interface TopFactor {
  feature: string;
  value: string | number;
  impact: number; // 0-1: relative importance
}

/**
 * Prediction Response DTO
 * Extended response format with DSS-specific fields for decision support
 */
export class PredictionResponseDto {
  @IsString()
  id: string; // Prediction record ID

  @IsString()
  @IsOptional()
  customerId?: string; // Linked customer (if from existing customer)

  @IsNumber()
  churnProbability: number; // 0-1: ML model output

  @IsEnum(RiskLevel)
  riskLevel: RiskLevel; // Derived from churnProbability

  @IsString()
  recommendation: string; // Business action recommendation (50-200 chars)

  @IsEnum(PriorityLevel)
  priority: PriorityLevel; // Action priority level

  @IsArray()
  @IsOptional()
  reasonCodes?: string[]; // Codes explaining recommendation choice

  @IsArray()
  @IsOptional()
  topFactors?: TopFactor[]; // Top 5 factors influencing prediction

  @IsObject()
  @IsOptional()
  inputSnapshot?: Record<string, any>; // Exact input used for prediction (auditability)

  @IsString()
  @IsOptional()
  modelVersion?: string; // ML model version used

  @IsString()
  @IsOptional()
  predictionMethod?: 'customer_based' | 'raw_input'; // Source of prediction

  @IsString()
  @IsOptional()
  status?: 'success' | 'failed'; // Prediction status

  @IsString()
  @IsOptional()
  createdAt?: string; // Timestamp of prediction
}

/**
 * Prediction Response with Metadata
 * Includes pagination and aggregation info
 */
export class PredictionListResponseDto {
  @IsArray()
  data: PredictionResponseDto[];

  @IsNumber()
  total: number; // Total count of predictions

  @IsNumber()
  page: number; // Current page

  @IsNumber()
  limit: number; // Items per page
}

/**
 * Prediction Stats Response
 * Aggregated statistics for dashboard
 */
export class PredictionStatsResponseDto {
  @IsNumber()
  totalPredictions: number;

  @IsNumber()
  highRisk: number; // Count of HIGH risk predictions

  @IsNumber()
  mediumRisk: number; // Count of MEDIUM risk predictions

  @IsNumber()
  lowRisk: number; // Count of LOW risk predictions

  @IsNumber()
  failedPredictions: number; // Count of failed predictions

  @IsOptional()
  @IsNumber()
  urgentCount?: number; // Count of URGENT priority recommendations
}
