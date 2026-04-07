import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { MakePredictionDto } from './dto/create-prediction.dto';
import {
  PredictionResponseDto,
  PredictionListResponseDto,
  PredictionStatsResponseDto,
} from './dto/prediction-response.dto';
import { WhatIfRequestDto, WhatIfComparisonDto } from './dto/what-if-request.dto';
import { MlService } from '../common/services/ml.service';

@Controller('predictions')
export class PredictionsController {
  constructor(
    private readonly predictionsService: PredictionsService,
    private readonly mlService: MlService,
  ) {}

  /**
   * Predict for existing customer by ID
   * POST /api/predictions/customer/:customerId
   */
  @Post('customer/:customerId')
  async predictByCustomerId(
    @Param('customerId') customerId: string,
  ): Promise<{ success: boolean; prediction: PredictionResponseDto }> {
    return this.predictionsService.predictByCustomerId(customerId);
  }

  /**
   * What-if Simulation: Compare base scenario with modified scenario
   * POST /api/predictions/what-if
   * Request: { customerId?: string, baseCustomer?: object, changes: object }
   * Response: { base: prediction, scenario: prediction, delta: { probabilityDelta, ... } }
   */
  @Post('what-if')
  async whatIf(
    @Body() whatIfRequest: WhatIfRequestDto,
  ): Promise<{ success: boolean; comparison: WhatIfComparisonDto }> {
    return this.predictionsService.whatIfSimulation(whatIfRequest);
  }

  /**
   * Predict with raw input
   * POST /api/predictions
   */
  @Post()
  async predict(
    @Body() makePredictionDto: MakePredictionDto,
    @Query('customerId') customerId?: string,
  ): Promise<{ success: boolean; prediction: PredictionResponseDto }> {
    if (!customerId) {
      customerId = new Date().getTime().toString();
    }
    return this.predictionsService.predict(customerId, makePredictionDto);
  }

  /**
   * Get ML service health status
   * GET /api/predictions/health
   */
  @Get('health')
  health() {
    return this.mlService.health();
  }

  /**
   * Get prediction statistics (counts by risk level)
   * GET /api/predictions/stats
   */
  @Get('stats')
  async stats(): Promise<PredictionStatsResponseDto> {
    return this.predictionsService.getStats();
  }

  /**
   * Get high-risk predictions
   * GET /api/predictions/high-risk
   */
  @Get('high-risk')
  async getHighRisk(
    @Query('limit') limit: number = 100,
  ): Promise<PredictionResponseDto[]> {
    return this.predictionsService.getHighRisk(limit);
  }

  /**
   * Get medium-risk predictions
   * GET /api/predictions/medium-risk
   */
  @Get('medium-risk')
  async getMediumRisk(
    @Query('limit') limit: number = 100,
  ): Promise<PredictionResponseDto[]> {
    return this.predictionsService.getMediumRisk(limit);
  }

  /**
   * Get prediction by ID
   * GET /api/predictions/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<PredictionResponseDto> {
    return this.predictionsService.findById(id);
  }

  /**
   * Delete prediction by ID
   * DELETE /api/predictions/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.predictionsService.remove(id);
  }

  /**
   * List all predictions with pagination
   * GET /api/predictions?page=1&limit=20&riskLevel=HIGH
   */
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('riskLevel') riskLevel?: string,
  ): Promise<PredictionListResponseDto> {
    return this.predictionsService.findAll(page, limit, riskLevel);
  }
}
