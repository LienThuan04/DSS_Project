import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prediction } from './schemas/prediction.schema';
import { CreatePredictionDto, MakePredictionDto } from './dto/create-prediction.dto';
import { MlService } from '../common/services/ml.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectModel(Prediction.name) private predictionModel: Model<Prediction>,
    private mlService: MlService,
    private customersService: CustomersService,
  ) {}

  async predict(customerId: string, data: MakePredictionDto): Promise<any> {
    try {
      // Call ML API
      const mlResult = await this.mlService.predict(data);

      if (!mlResult.success) {
        // Save failed prediction
        const failedPred = new this.predictionModel({
          customerId,
          status: 'failed',
          errorMessage: mlResult.error,
          inputData: data,
        });
        await failedPred.save();

        throw new BadRequestException(mlResult.error);
      }

      // Save successful prediction
      const prediction = new this.predictionModel({
        customerId,
        churnProbability: mlResult.churnProbability,
        riskLevel: mlResult.riskLevel,
        recommendation: mlResult.recommendation,
        priority: mlResult.priority,
        inputData: data,
        status: 'success',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      });

      const savedPrediction = await prediction.save();

      return {
        success: true,
        prediction: {
          id: savedPrediction._id,
          customerId: savedPrediction.customerId,
          churnProbability: savedPrediction.churnProbability,
          riskLevel: savedPrediction.riskLevel,
          recommendation: savedPrediction.recommendation,
          priority: savedPrediction.priority,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async predictByCustomerId(customerId: string): Promise<any> {
    try {
      // Get customer from database
      const customer = await this.customersService.findByCustomerId(customerId);

      // Prepare feature data
      const featureData: MakePredictionDto = {
        tenure: customer.tenure || 0,
        MonthlyCharges: customer.MonthlyCharges || 0,
        TotalCharges: customer.TotalCharges || 0,
        SeniorCitizen: customer.SeniorCitizen || 0,
      };

      // Make prediction
      return await this.predict(customer._id.toString(), featureData);
    } catch (error) {
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    riskLevel?: string,
  ): Promise<{
    data: Prediction[];
    total: number;
    page: number;
    limit: number;
  }> {
    let query = { status: 'success' };
    if (riskLevel) {
      query['riskLevel'] = riskLevel;
    }

    const total = await this.predictionModel.countDocuments(query);
    const data = await this.predictionModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<Prediction> {
    const prediction = await this.predictionModel.findById(id);
    if (!prediction) {
      throw new NotFoundException(`Prediction ${id} not found`);
    }
    return prediction;
  }

  async getHighRisk(limit: number = 100): Promise<Prediction[]> {
    return this.predictionModel
      .find({ riskLevel: 'HIGH', status: 'success' })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getMediumRisk(limit: number = 100): Promise<Prediction[]> {
    return this.predictionModel
      .find({ riskLevel: 'MEDIUM', status: 'success' })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getStats(): Promise<{
    totalPredictions: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    failedPredictions: number;
  }> {
    const total = await this.predictionModel.countDocuments({ status: 'success' });
    const highRisk = await this.predictionModel.countDocuments({
      riskLevel: 'HIGH',
      status: 'success',
    });
    const mediumRisk = await this.predictionModel.countDocuments({
      riskLevel: 'MEDIUM',
      status: 'success',
    });
    const lowRisk = await this.predictionModel.countDocuments({
      riskLevel: 'LOW',
      status: 'success',
    });
    const failedPredictions = await this.predictionModel.countDocuments({
      status: 'failed',
    });

    return {
      totalPredictions: total,
      highRisk,
      mediumRisk,
      lowRisk,
      failedPredictions,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.predictionModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Prediction ${id} not found`);
    }
    return { message: `Prediction ${id} deleted` };
  }
}
