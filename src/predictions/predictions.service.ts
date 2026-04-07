import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prediction } from './schemas/prediction.schema';
import { CreatePredictionDto, MakePredictionDto } from './dto/create-prediction.dto';
import { PredictionResponseDto } from './dto/prediction-response.dto';
import { WhatIfRequestDto } from './dto/what-if-request.dto';
import { MlService } from '../common/services/ml.service';
import { RecommendationService } from '../common/services/recommendation.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectModel(Prediction.name) private predictionModel: Model<Prediction>,
    private mlService: MlService,
    private recommendationService: RecommendationService,
    private customersService: CustomersService,
  ) { }

  async predict(customerId: string, data: MakePredictionDto): Promise<any> {
    try {
      // Call ML API
      const mlResult = await this.mlService.predict(data);

      if (!mlResult.success) {
        // Save failed prediction for audit trail
        const failedPred = new this.predictionModel({
          customerId,
          status: 'failed',
          errorMessage: mlResult.error,
          inputSnapshot: data, // Store exact input for auditability
          inputData: data,
        });
        await failedPred.save();

        throw new BadRequestException(mlResult.error);
      }

      // Get recommendation from rules engine
      const recommendationInput = {
        churnProbability: mlResult.churnProbability,
        tenure: data.tenure,
        monthlyCharges: data.MonthlyCharges,
        contract: data.Contract ? data.Contract.toString() : undefined,
        paymentMethod: data.PaymentMethod ? data.PaymentMethod.toString() : undefined,
        internetService: data.InternetService ? data.InternetService.toString() : undefined,
        onlineSecurityService: data.onlineSecurityService,
        techSupportService: data.techSupportService,
      };

      const recommendation = this.recommendationService.getRecommendation(recommendationInput);
      const riskLevel = this.recommendationService.getRiskLevel(mlResult.churnProbability);

      // Save successful prediction with full DSS output
      const prediction = new this.predictionModel({
        customerId,
        churnProbability: mlResult.churnProbability,
        riskLevel,
        recommendation: recommendation.recommendation,
        priority: recommendation.priority,
        reasonCodes: recommendation.reasonCodes,
        topFactors: mlResult.topFactors || [], // Store explainability data
        inputSnapshot: data, // Preserve exact input for auditability
        inputData: data,
        status: 'success',
        modelVersion: process.env.MODEL_VERSION || '1.0.0',
        predictionMethod: 'raw_input',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      });

      const savedPrediction = await prediction.save();

      return {
        success: true,
        prediction: this.formatPredictionResponse(savedPrediction),
      };
    } catch (error) {
      throw error;
    }
  }

  async predictByCustomerId(customerId: string): Promise<any> {
    try {
      // Get customer from database
      const customer = await this.customersService.findByCustomerId(customerId);

      // Prepare ALL feature data from customer record (must match input_schema.json)
      const featureData: MakePredictionDto = {
        gender: customer.gender || 'Male',
        SeniorCitizen: customer.SeniorCitizen || 0,
        Partner: customer.Partner || 'No',
        Dependents: customer.Dependents || 'No',
        tenure: customer.tenure || 0,
        PhoneService: customer.PhoneService || 'No',
        MultipleLines: customer.MultipleLines || 'No',
        InternetService: customer.InternetService || 'DSL',
        OnlineSecurity: customer.OnlineSecurity || 'No',
        OnlineBackup: customer.OnlineBackup || 'No',
        DeviceProtection: customer.DeviceProtection || 'No',
        TechSupport: customer.TechSupport || 'No',
        StreamingTV: customer.StreamingTV || 'No',
        StreamingMovies: customer.StreamingMovies || 'No',
        Contract: customer.Contract || 'Month-to-month',
        PaperlessBilling: customer.PaperlessBilling || 'Yes',
        PaymentMethod: customer.PaymentMethod || 'Electronic check',
        MonthlyCharges: customer.MonthlyCharges || 0,
        TotalCharges: customer.TotalCharges || 0,
      };

      // Call ML API for prediction
      const mlResult = await this.mlService.predict(featureData);

      if (!mlResult.success) {
        throw new BadRequestException(mlResult.error);
      }

      // Get recommendation from rules engine using customer features
      const recommendationInput = {
        churnProbability: mlResult.churnProbability,
        tenure: customer.tenure,
        monthlyCharges: customer.MonthlyCharges,
        contract: customer.Contract,
        paymentMethod: customer.PaymentMethod,
        internetService: customer.InternetService,
        onlineSecurityService: customer.OnlineSecurity === 'Yes',
        techSupportService: customer.TechSupport === 'Yes',
      };

      const recommendation = this.recommendationService.getRecommendation(recommendationInput);
      const riskLevel = this.recommendationService.getRiskLevel(mlResult.churnProbability);

      // Save prediction with customer_based method
      const prediction = new this.predictionModel({
        customerId,
        churnProbability: mlResult.churnProbability,
        riskLevel,
        recommendation: recommendation.recommendation,
        priority: recommendation.priority,
        reasonCodes: recommendation.reasonCodes,
        topFactors: mlResult.topFactors || [],
        inputSnapshot: featureData,
        inputData: featureData,
        status: 'success',
        modelVersion: process.env.MODEL_VERSION || '1.0.0',
        predictionMethod: 'customer_based',
        customerName: customer.customerID,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      const savedPrediction = await prediction.save();

      return {
        success: true,
        prediction: this.formatPredictionResponse(savedPrediction),
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    riskLevel?: string,
  ): Promise<{
    data: PredictionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    let query = { status: 'success' };
    if (riskLevel) {
      query['riskLevel'] = riskLevel;
    }

    const total = await this.predictionModel.countDocuments(query);
    const predictions = await this.predictionModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const data = predictions.map(pred => this.formatPredictionResponse(pred));

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<PredictionResponseDto> {
    const prediction = await this.predictionModel.findById(id);
    if (!prediction) {
      throw new NotFoundException(`Prediction ${id} not found`);
    }
    return this.formatPredictionResponse(prediction);
  }

  async getHighRisk(limit: number = 100): Promise<PredictionResponseDto[]> {
    const predictions = await this.predictionModel
      .find({ riskLevel: 'HIGH', status: 'success' })
      .sort({ createdAt: -1 })
      .limit(limit);

    return predictions.map(pred => this.formatPredictionResponse(pred));
  }

  async getMediumRisk(limit: number = 100): Promise<PredictionResponseDto[]> {
    const predictions = await this.predictionModel
      .find({ riskLevel: 'MEDIUM', status: 'success' })
      .sort({ createdAt: -1 })
      .limit(limit);

    return predictions.map(pred => this.formatPredictionResponse(pred));
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

  /**
   * What-if Simulation: Compare base scenario with modified scenario
   * POST /api/predictions/what-if
   */
  async whatIfSimulation(whatIfRequest: any): Promise<any> {
    const { customerId, baseCustomer, changes, scenarioName } = whatIfRequest;

    // Validate input
    if (!customerId && !baseCustomer) {
      throw new BadRequestException(
        'Either customerId (to load from DB) or baseCustomer (direct data) must be provided',
      );
    }

    let baseData: any;

    // Get base customer data
    if (customerId) {
      let customer;
      console.log(`[WhatIf] Looking up customer with customerId: ${customerId}`);

      // Check if customerId looks like a MongoDB ObjectId (24 hex characters)
      const isObjectId = /^[a-f0-9]{24}$/.test(customerId);
      console.log(`[WhatIf] Is ObjectId format: ${isObjectId}`);

      try {
        if (isObjectId) {
          // It's a MongoDB _id - try findById first
          try {
            customer = await this.customersService.findById(customerId);
            console.log(`[WhatIf] Found customer by MongoDB _id: ${customerId}`);
          } catch (err) {
            console.log(`[WhatIf] findById failed, trying findByCustomerId: ${err.message}`);
            customer = await this.customersService.findByCustomerId(customerId);
          }
        } else {
          // It's a customerID - try findByCustomerId first
          try {
            customer = await this.customersService.findByCustomerId(customerId);
            console.log(`[WhatIf] Found customer by customerID: ${customerId}`);
          } catch (err) {
            console.log(`[WhatIf] findByCustomerId failed, trying findById: ${err.message}`);
            customer = await this.customersService.findById(customerId);
          }
        }
      } catch (err: any) {
        console.log(`[WhatIf] All lookup strategies failed for customerId: ${customerId}`);
        throw new BadRequestException(
          `Could not find customer with ID "${customerId}". ${err.message}`,
        );
      }
      baseData = {
        gender: customer.gender || 'Male',
        SeniorCitizen: customer.SeniorCitizen || 0,
        Partner: customer.Partner || 'No',
        Dependents: customer.Dependents || 'No',
        tenure: customer.tenure || 0,
        PhoneService: customer.PhoneService || 'No',
        MultipleLines: customer.MultipleLines || 'No',
        InternetService: customer.InternetService || 'DSL',
        OnlineSecurity: customer.OnlineSecurity || 'No',
        OnlineBackup: customer.OnlineBackup || 'No',
        DeviceProtection: customer.DeviceProtection || 'No',
        TechSupport: customer.TechSupport || 'No',
        StreamingTV: customer.StreamingTV || 'No',
        StreamingMovies: customer.StreamingMovies || 'No',
        Contract: customer.Contract || 'Month-to-month',
        PaperlessBilling: customer.PaperlessBilling || 'Yes',
        PaymentMethod: customer.PaymentMethod || 'Electronic check',
        MonthlyCharges: customer.MonthlyCharges || 0,
        TotalCharges: customer.TotalCharges || 0,
      };
    } else {
      baseData = baseCustomer;
    }

    // Prepare scenario data by merging changes
    const scenarioData = { ...baseData, ...(changes || {}) };

    // Make predictions for both base and scenario
    const basePrediction = await this.mlService.predict(baseData);
    const scenarioPrediction = await this.mlService.predict(scenarioData);

    if (!basePrediction.success || !scenarioPrediction.success) {
      throw new BadRequestException(
        'Failed to generate predictions: ' +
        (basePrediction.error || scenarioPrediction.error),
      );
    }

    // Get recommendations and risk levels
    const baseRecommendation = this.recommendationService.getRecommendation({
      churnProbability: basePrediction.churnProbability,
      tenure: baseData.tenure,
      monthlyCharges: baseData.MonthlyCharges,
      contract: baseData.Contract,
      paymentMethod: baseData.PaymentMethod,
      internetService: baseData.InternetService,
      onlineSecurityService: baseData.OnlineSecurity === 'Yes',
      techSupportService: baseData.TechSupport === 'Yes',
    });

    const scenarioRecommendation = this.recommendationService.getRecommendation({
      churnProbability: scenarioPrediction.churnProbability,
      tenure: scenarioData.tenure,
      monthlyCharges: scenarioData.MonthlyCharges,
      contract: scenarioData.Contract,
      paymentMethod: scenarioData.PaymentMethod,
      internetService: scenarioData.InternetService,
      onlineSecurityService: scenarioData.OnlineSecurity === 'Yes',
      techSupportService: scenarioData.TechSupport === 'Yes',
    });

    const baseRiskLevel = this.recommendationService.getRiskLevel(
      basePrediction.churnProbability,
    );
    const scenarioRiskLevel = this.recommendationService.getRiskLevel(
      scenarioPrediction.churnProbability,
    );

    // Calculate delta
    const probabilityDelta = scenarioPrediction.churnProbability - basePrediction.churnProbability;
    const probabilityDeltaPercent =
      basePrediction.churnProbability > 0
        ? (probabilityDelta / basePrediction.churnProbability) * 100
        : 0;

    const riskLevelChanged = baseRiskLevel !== scenarioRiskLevel;
    const recommendationChanged = baseRecommendation.priority !== scenarioRecommendation.priority;
    const priorityChanged = baseRecommendation.priority !== scenarioRecommendation.priority;

    // Build summary
    let summary = '';
    if (probabilityDelta > 0) {
      summary += `Churn risk increases by ${Math.abs(probabilityDeltaPercent).toFixed(1)}%. `;
    } else if (probabilityDelta < 0) {
      summary += `Churn risk decreases by ${Math.abs(probabilityDeltaPercent).toFixed(1)}%. `;
    } else {
      summary += `Churn risk remains unchanged. `;
    }

    if (riskLevelChanged) {
      summary += `Risk level changes from ${baseRiskLevel} to ${scenarioRiskLevel}. `;
    }

    if (priorityChanged) {
      summary += `Recommended action priority changes from ${baseRecommendation.priority} to ${scenarioRecommendation.priority}.`;
    }

    const comparison = {
      scenarioName: scenarioName || 'Unnamed Scenario',
      base: {
        churnProbability: basePrediction.churnProbability,
        riskLevel: baseRiskLevel,
        recommendation: baseRecommendation.recommendation,
        priority: baseRecommendation.priority,
      },
      scenario: {
        churnProbability: scenarioPrediction.churnProbability,
        riskLevel: scenarioRiskLevel,
        recommendation: scenarioRecommendation.recommendation,
        priority: scenarioRecommendation.priority,
      },
      delta: {
        probabilityDelta,
        probabilityDeltaPercent,
        riskLevelChanged,
        recommendationChanged,
        priorityChanged,
        summary,
      },
      inputSnapshot: {
        base: baseData,
        changes: changes || {},
        scenario: scenarioData,
      },
    };

    return {
      success: true,
      comparison,
    };
  }

  /**
   * Format prediction document to response DTO
   * Includes all DSS-specific fields for API response
   */
  private formatPredictionResponse(prediction: any): PredictionResponseDto {
    return {
      id: prediction._id.toString(),
      customerId: prediction.customerId,
      churnProbability: prediction.churnProbability,
      riskLevel: prediction.riskLevel,
      recommendation: prediction.recommendation,
      priority: prediction.priority,
      reasonCodes: prediction.reasonCodes || [],
      topFactors: prediction.topFactors || [],
      inputSnapshot: prediction.inputSnapshot,
      modelVersion: prediction.modelVersion,
      predictionMethod: prediction.predictionMethod,
      status: prediction.status,
      createdAt: prediction.createdAt?.toISOString(),
    };
  }
}
