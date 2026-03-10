import { IsString, IsOptional, IsObject } from 'class-validator';

/**
 * What-if Simulation Request DTO
 * Allows users to compare base scenario with modified scenario
 */
export class WhatIfRequestDto {
  // Option 1: Use existing customer as base
  @IsString()
  @IsOptional()
  customerId?: string;

  // Option 2: Provide base customer data directly
  @IsObject()
  @IsOptional()
  baseCustomer?: Record<string, any>;

  // Modifications to apply to base customer
  @IsObject()
  @IsOptional()
  changes?: Record<string, any>;

  // Description for this what-if scenario (optional)
  @IsString()
  @IsOptional()
  scenarioName?: string;
}

/**
 * What-if Comparison Response
 * Returns both the base and scenario predictions with delta
 */
export interface WhatIfComparisonDto {
  scenarioName?: string;
  base: {
    churnProbability: number;
    riskLevel: string;
    recommendation: string;
    priority: string;
  };
  scenario: {
    churnProbability: number;
    riskLevel: string;
    recommendation: string;
    priority: string;
  };
  delta: {
    probabilityDelta: number; // scenario - base
    probabilityDeltaPercent: number; // (delta / base) * 100
    riskLevelChanged: boolean;
    recommendationChanged: boolean;
    priorityChanged: boolean;
    summary: string; // Human-readable summary of changes
  };
  inputSnapshot: {
    base: Record<string, any>;
    changes: Record<string, any>;
    scenario: Record<string, any>;
  };
}
