/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { Prediction } from './schemas/prediction.schema';
import { MlService } from '../common/services/ml.service';
import { RecommendationService } from '../common/services/recommendation.service';
import { CustomersService } from '../customers/customers.service';

describe('PredictionsService - BE-03 Integration Tests', () => {
  let service: PredictionsService;
  let mockPredictionModel: any;
  let mockMlService: any;
  let mockRecommendationService: any;
  let mockCustomersService: any;

  const mockCustomer = {
    _id: 'cust_mongo_id',
    customerID: 'CUST001',
    tenure: 24,
    MonthlyCharges: 85.5,
    TotalCharges: 2052,
    SeniorCitizen: 0,
    Contract: 'One year',
    PaymentMethod: 'Bank transfer',
    InternetService: 'Fiber optic',
    OnlineSecurity: 'Yes',
    TechSupport: 'Yes',
    Churn: 'No',
  };

  const mockMLResponse = {
    success: true,
    churnProbability: 0.72,
    riskLevel: 'HIGH',
    recommendation: 'Review contract',
    priority: 'HIGH',
    topFactors: [
      { feature: 'tenure', value: '24', impact: 0.15 },
      { feature: 'MonthlyCharges', value: '85.5', impact: 0.12 },
    ],
  };

  const mockRecommendation = {
    recommendation: 'Contract upgrade recommended with discount',
    priority: 'HIGH',
    reasonCodes: ['HIGH_CHURN_HIGH_VALUE'],
  };

  const mockRiskLevel = 'HIGH';

  beforeEach(async () => {
    // Mock Prediction Model
    const mockSaveInstance = {
      _id: 'pred_123',
      customerId: 'CUST001',
      churnProbability: 0.72,
      riskLevel: 'HIGH',
      recommendation: 'Contract upgrade recommended with discount',
      priority: 'HIGH',
      reasonCodes: ['HIGH_CHURN_HIGH_VALUE'],
      topFactors: [],
      inputSnapshot: {},
      status: 'success',
      modelVersion: '1.0.0',
      predictionMethod: 'customer_based',
      createdAt: new Date(),
    };

    mockPredictionModel = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue(mockSaveInstance),
    }));

    mockPredictionModel.find = jest.fn();
    mockPredictionModel.findById = jest.fn();
    mockPredictionModel.countDocuments = jest.fn();
    mockPredictionModel.findByIdAndDelete = jest.fn();

    // Mock ML Service
    mockMlService = {
      predict: jest.fn().mockResolvedValue(mockMLResponse),
      health: jest.fn().mockResolvedValue({ status: 'healthy' }),
    };

    // Mock Recommendation Service
    mockRecommendationService = {
      getRecommendation: jest.fn().mockReturnValue(mockRecommendation),
      getRiskLevel: jest.fn().mockReturnValue(mockRiskLevel),
    };

    // Mock Customers Service
    mockCustomersService = {
      findByCustomerId: jest.fn().mockResolvedValue(mockCustomer),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredictionsService,
        {
          provide: getModelToken(Prediction.name),
          useValue: mockPredictionModel,
        },
        {
          provide: MlService,
          useValue: mockMlService,
        },
        {
          provide: RecommendationService,
          useValue: mockRecommendationService,
        },
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
      ],
    }).compile();

    service = module.get<PredictionsService>(PredictionsService);
  });

  describe('predictByCustomerId - Happy Path', () => {
    it('should successfully predict for existing customer', async () => {
      const result = await service.predictByCustomerId('CUST001');

      expect(result.success).toBe(true);
      expect(result.prediction).toBeDefined();
      expect(result.prediction.customerId).toBe('CUST001');
      expect(result.prediction.churnProbability).toBe(0.72);
    });

    it('should load customer from database and extract features', async () => {
      await service.predictByCustomerId('CUST001');

      expect(mockCustomersService.findByCustomerId).toHaveBeenCalledWith('CUST001');
    });

    it('should call ML service with customer features', async () => {
      await service.predictByCustomerId('CUST001');

      expect(mockMlService.predict).toHaveBeenCalled();
    });

    it('should apply recommendation rules using customer data', async () => {
      await service.predictByCustomerId('CUST001');

      expect(mockRecommendationService.getRecommendation).toHaveBeenCalledWith(
        expect.objectContaining({
          churnProbability: 0.72,
          tenure: 24,
          monthlyCharges: 85.5,
        }),
      );
    });

    it('should save prediction record with DSS fields', async () => {
      const result = await service.predictByCustomerId('CUST001');

      expect(result.prediction.recommendation).toBeDefined();
      expect(result.prediction.priority).toBe('HIGH');
    });

    it('should return formatted response with all DSS fields', async () => {
      const result = await service.predictByCustomerId('CUST001');

      expect(result.prediction).toMatchObject({
        customerId: expect.any(String),
        churnProbability: expect.any(Number),
        riskLevel: expect.any(String),
        recommendation: expect.any(String),
        priority: expect.any(String),
      });
    });

    it('should set predictionMethod to customer_based', async () => {
      const result = await service.predictByCustomerId('CUST001');
      expect(result.prediction.predictionMethod).toBe('customer_based');
    });
  });

  describe('predictByCustomerId - Error Handling', () => {
    it('should return 404 if customer not found', async () => {
      mockCustomersService.findByCustomerId.mockRejectedValueOnce(
        new NotFoundException('Customer not found'),
      );

      await expect(service.predictByCustomerId('INVALID_ID')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle ML API errors gracefully', async () => {
      mockMlService.predict.mockRejectedValueOnce(
        new BadRequestException('ML service unavailable'),
      );

      await expect(service.predictByCustomerId('CUST001')).rejects.toThrow();
    });

    it('should handle ML API returning success=false', async () => {
      mockMlService.predict.mockResolvedValueOnce({
        success: false,
        error: 'Invalid features',
      });

      await expect(service.predictByCustomerId('CUST001')).rejects.toThrow();
    });

    it('should handle missing optional customer fields', async () => {
      const sparseCustomer = {
        customerID: 'CUST002',
        tenure: 0,
        MonthlyCharges: 0,
      };

      mockCustomersService.findByCustomerId.mockResolvedValueOnce(sparseCustomer);

      const result = await service.predictByCustomerId('CUST002');

      expect(result.success).toBe(true);
      expect(result.prediction).toBeDefined();
    });
  });

  describe('predictByCustomerId - Data Integrity', () => {
    it('should preserve customer ID in response', async () => {
      const result = await service.predictByCustomerId('CUST001');

      expect(result.prediction.customerId).toBe('CUST001');
    });

    it('should map customer features correctly to ML input', async () => {
      await service.predictByCustomerId('CUST001');

      const callArgs = (mockMlService.predict as jest.Mock).mock.calls[0][0];

      expect(callArgs).toHaveProperty('tenure');
      expect(callArgs).toHaveProperty('MonthlyCharges');
      expect(callArgs).toHaveProperty('TotalCharges');
    });

    it('should transform OnlineSecurity string to boolean', async () => {
      await service.predictByCustomerId('CUST001');

      const recArgs = (mockRecommendationService.getRecommendation as jest.Mock).mock
        .calls[0][0];

      expect(typeof recArgs.onlineSecurityService).toBe('boolean');
    });
  });

  describe('predictByCustomerId - Response Format', () => {
    it('should return response with success flag', async () => {
      const result = await service.predictByCustomerId('CUST001');

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('prediction');
    });

    it('should have valid enum values for priority', async () => {
      const result = await service.predictByCustomerId('CUST001');

      const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
      expect(validPriorities).toContain(result.prediction.priority);
    });

    it('should have valid enum values for risk level', async () => {
      const result = await service.predictByCustomerId('CUST001');

      const validRiskLevels = ['LOW', 'MEDIUM', 'HIGH'];
      expect(validRiskLevels).toContain(result.prediction.riskLevel);
    });
  });
});
