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
import { MlService } from '../common/services/ml.service';

@Controller('predictions')
export class PredictionsController {
  constructor(
    private readonly predictionsService: PredictionsService,
    private readonly mlService: MlService,
  ) {}

  @Post('customer/:customerId')
  predictByCustomerId(@Param('customerId') customerId: string) {
    return this.predictionsService.predictByCustomerId(customerId);
  }

  @Post()
  predict(@Body() makePredictonDto: MakePredictionDto, @Query('customerId') customerId: string) {
    if (!customerId) {
      customerId = new Date().getTime().toString();
    }
    return this.predictionsService.predict(customerId, makePredictonDto);
  }

  @Get('health')
  health() {
    return this.mlService.health();
  }

  @Get('stats')
  stats() {
    return this.predictionsService.getStats();
  }

  @Get('high-risk')
  getHighRisk(@Query('limit') limit: number = 100) {
    return this.predictionsService.getHighRisk(limit);
  }

  @Get('medium-risk')
  getMediumRisk(@Query('limit') limit: number = 100) {
    return this.predictionsService.getMediumRisk(limit);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.predictionsService.findById(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.predictionsService.remove(id);
  }

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('riskLevel') riskLevel?: string,
  ) {
    return this.predictionsService.findAll(page, limit, riskLevel);
  }
}
