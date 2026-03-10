import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PredictionsService } from './predictions.service';
import { Prediction } from './schemas/prediction.schema';
import { MlService } from '../common/services/ml.service';
import { NotFoundException } from '@nestjs/common';

describe('PredictionsService', () => {
  let service: PredictionsService;
  let mockPredictionModel: any;
  let mockMlService: any;

  const mockPrediction = {
    _id: 'pred1',
    customerId: 'CUST001',
    churnProbability: 0.75,
    riskLevel: 'HIGH',
    recommendation: 'Offer discount',
    priority: 'URGENT',
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    mockPredictionModel = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    mockMlService = {
      predict: jest.fn().mockResolvedValue({
        churn_probability: 0.75,
        risk_level: 'HIGH',
        recommendation: 'Offer discount',
        priority: 'URGENT',
      }),
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
      ],
    }).compile();

    service = module.get<PredictionsService>(PredictionsService);
  });

  describe('predict', () => {
    it('should call ML service and create prediction', async () => {
      mockPredictionModel.create.mockResolvedValue(mockPrediction);

      const inputData = {
        customerId: 'CUST001',
        tenure: 12,
        MonthlyCharges: 65.5,
      };

      const result = await service.predict(inputData);
      expect(mockMlService.predict).toHaveBeenCalled();
      expect(result).toHaveProperty('churnProbability');
    });
  });

  describe('findAll', () => {
    it('should return paginated predictions', async () => {
      mockPredictionModel.countDocuments.mockResolvedValue(50);
      mockPredictionModel.find = jest.fn().mockReturnThis();

      const result = await service.findAll(1, 20);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
    });
  });

  describe('findById', () => {
    it('should return a prediction by ID', async () => {
      mockPredictionModel.findById.mockResolvedValue(mockPrediction);

      const result = await service.findById('pred1');
      expect(result).toEqual(mockPrediction);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPredictionModel.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getHighRisk', () => {
    it('should return high-risk predictions', async () => {
      mockPredictionModel.find = jest.fn().mockResolvedValue([mockPrediction]);

      const result = await service.getHighRisk();
      expect(result).toHaveLength(1);
      expect(result[0].riskLevel).toBe('HIGH');
    });
  });

  describe('getStats', () => {
    it('should return prediction statistics', async () => {
      mockPredictionModel.countDocuments
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(30) // high
        .mockResolvedValueOnce(50) // medium
        .mockResolvedValueOnce(20); // low

      const result = await service.getStats();
      expect(result).toHaveProperty('totalPredictions', 100);
      expect(result).toHaveProperty('highRisk', 30);
    });
  });
});
