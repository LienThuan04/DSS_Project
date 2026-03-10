import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CustomersService } from './customers.service';
import { Customer } from './schemas/customer.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let mockCustomerModel: any;

  const mockCustomer = {
    _id: '1',
    customerID: 'CUST001',
    gender: 'Male',
    tenure: 12,
    MonthlyCharges: 65.5,
    TotalCharges: 786,
    Churn: 'No',
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    mockCustomerModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getModelToken(Customer.name),
          useValue: mockCustomerModel,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const createCustomerDto = {
        customerID: 'CUST001',
        gender: 'Male',
        tenure: 12,
      };

      mockCustomerModel.create = jest.fn().mockResolvedValue(mockCustomer);

      const result = await service.create(createCustomerDto);
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('findAll', () => {
    it('should return paginated customers', async () => {
      mockCustomerModel.countDocuments.mockResolvedValue(100);
      mockCustomerModel.find = jest.fn().mockReturnThis();

      const result = await service.findAll(1, 20);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
    });
  });

  describe('findById', () => {
    it('should return a customer by ID', async () => {
      mockCustomerModel.findById.mockResolvedValue(mockCustomer);

      const result = await service.findById('1');
      expect(result).toEqual(mockCustomer);
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockCustomerModel.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      mockCustomerModel.findByIdAndDelete.mockResolvedValue(mockCustomer);

      const result = await service.remove('1');
      expect(result.message).toContain('deleted successfully');
    });
  });

  describe('parseAndValidateCsv', () => {
    it('should parse valid CSV', async () => {
      const csv = `customerID,gender,tenure
CUST001,Male,12
CUST002,Female,24`;

      const result = await service.parseAndValidateCsv(csv);
      expect(result).toHaveLength(2);
      expect(result[0].customerID).toBe('CUST001');
    });

    it('should throw error for empty CSV', async () => {
      const csv = 'customerID,gender,tenure';

      await expect(service.parseAndValidateCsv(csv)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getStats', () => {
    it('should return customer statistics', async () => {
      mockCustomerModel.countDocuments.mockResolvedValueOnce(100);
      mockCustomerModel.countDocuments.mockResolvedValueOnce(20);

      const result = await service.getStats();
      expect(result).toHaveProperty('totalCustomers', 100);
      expect(result).toHaveProperty('churned', 20);
      expect(result).toHaveProperty('churnRate');
    });
  });
});
