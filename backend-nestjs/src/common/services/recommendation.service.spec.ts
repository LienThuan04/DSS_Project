/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService, RecommendationInput } from './recommendation.service';

describe('RecommendationService', () => {
  let service: RecommendationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecommendationService],
    }).compile();

    service = module.get<RecommendationService>(RecommendationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Rule 1: Critical New Customer (URGENT)', () => {
    it('should return URGENT for churn > 85% and tenure < 6 months', () => {
      const input: RecommendationInput = {
        churnProbability: 0.90,
        tenure: 3,
        monthlyCharges: 80,
        contract: 'Month-to-month',
      };

      const result = service.getRecommendation(input);

      expect(result.priority).toBe('URGENT');
      expect(result.reasonCodes).toContain('CRITICAL_NEW_CUSTOMER');
      expect(result.reasonCodes).toContain('EXTREME_CHURN_RISK');
      expect(result.recommendation).toContain('Immediate intervention');
    });

    it('should not trigger if tenure >= 6 months', () => {
      const input: RecommendationInput = {
        churnProbability: 0.90,
        tenure: 6,
        monthlyCharges: 80,
        contract: 'Month-to-month',
      };

      const result = service.getRecommendation(input);

      expect(result.reasonCodes).not.toContain('CRITICAL_NEW_CUSTOMER');
    });

    it('should not trigger if churn <= 85%', () => {
      const input: RecommendationInput = {
        churnProbability: 0.84,
        tenure: 3,
        monthlyCharges: 80,
        contract: 'Month-to-month',
      };

      const result = service.getRecommendation(input);

      expect(result.reasonCodes).not.toContain('CRITICAL_NEW_CUSTOMER');
    });
  });

  describe('Rule 2: Month-to-Month High Risk (URGENT)', () => {
    it('should return URGENT for churn > 75% with month-to-month contract', () => {
      const input: RecommendationInput = {
        churnProbability: 0.80,
        tenure: 24,
        contract: 'Month-to-month',
        monthlyCharges: 70,
      };

      const result = service.getRecommendation(input);

      expect(result.priority).toBe('URGENT');
      expect(result.reasonCodes).toContain('HIGH_CHURN_MONTH_TO_MONTH');
      expect(result.reasonCodes).toContain('CONTRACT_UPGRADE_OPPORTUNITY');
    });

    it('should not trigger with one-year contract', () => {
      const input: RecommendationInput = {
        churnProbability: 0.80,
        tenure: 24,
        contract: 'One year',
        monthlyCharges: 70,
      };

      const result = service.getRecommendation(input);

      expect(result.reasonCodes).not.toContain('HIGH_CHURN_MONTH_TO_MONTH');
    });
  });

  describe('Rule 3: High-Value Customer (HIGH)', () => {
    it('should return HIGH for churn > 70% with monthly charges > $100', () => {
      const input: RecommendationInput = {
        churnProbability: 0.72,
        monthlyCharges: 120,
        tenure: 12,
        contract: 'One year',
      };

      const result = service.getRecommendation(input);

      expect(result.priority).toBe('HIGH');
      expect(result.reasonCodes).toContain('HIGH_CHURN_HIGH_VALUE');
      expect(result.recommendation).toContain('High-value customer');
    });

    it('should not trigger with low monthly charges', () => {
      const input: RecommendationInput = {
        churnProbability: 0.72,
        monthlyCharges: 80,
        tenure: 12,
      };

      const result = service.getRecommendation(input);

      expect(result.reasonCodes).not.toContain('HIGH_CHURN_HIGH_VALUE');
    });
  });

  describe('Rule 4: Electronic Check Payment (HIGH)', () => {
    it('should return HIGH for churn > 70% with electronic check payment', () => {
      const input: RecommendationInput = {
        churnProbability: 0.75,
        paymentMethod: 'Electronic check',
        monthlyCharges: 80,
      };

      const result = service.getRecommendation(input);

      expect(result.priority).toBe('HIGH');
      expect(result.reasonCodes).toContain('HIGH_CHURN_CHECK_PAYMENT');
      expect(result.reasonCodes).toContain('PAYMENT_METHOD_INTERVENTION');
    });

    it('should not trigger with bank transfer', () => {
      const input: RecommendationInput = {
        churnProbability: 0.75,
        paymentMethod: 'Bank transfer',
        monthlyCharges: 80,
      };

      const result = service.getRecommendation(input);

      expect(result.reasonCodes).not.toContain('HIGH_CHURN_CHECK_PAYMENT');
    });
  });

  describe('Rule 5: Early Tenure Churn (HIGH)', () => {
    it('should return HIGH for churn > 60% with tenure 1-12 months', () => {
      const input: RecommendationInput = {
        churnProbability: 0.65,
        tenure: 6,
        monthlyCharges: 70,
      };

      const result = service.getRecommendation(input);

      expect(result.priority).toBe('HIGH');
      expect(result.reasonCodes).toContain('EARLY_TENURE_CHURN');
      expect(result.reasonCodes).toContain('CUSTOMER_SUCCESS_INTERVENTION');
    });

    it('should not trigger with 0 tenure', () => {
      const input: RecommendationInput = {
        churnProbability: 0.65,
        tenure: 0,
      };

      const result = service.getRecommendation(input);

      expect(result.reasonCodes).not.toContain('EARLY_TENURE_CHURN');
    });

    it('should not trigger with tenure >= 12 months', () => {
      const input: RecommendationInput = {
        churnProbability: 0.65,
        tenure: 12,
      };

      const result = service.getRecommendation(input);

      expect(result.reasonCodes).not.toContain('EARLY_TENURE_CHURN');
    });
  });

  describe('Rule 6: No Add-on Services (HIGH)', () => {
    it('should return HIGH for churn > 65% without security and tech support', () => {
      const input: RecommendationInput = {
        churnProbability: 0.68,
        onlineSecurityService: false,
        techSupportService: false,
        monthlyCharges: 70,
      };

      const result = service.getRecommendation(input);

      expect(result.priority).toBe('HIGH');
      expect(result.reasonCodes).toContain('HIGH_CHURN_NO_ADDONS');
      expect(result.reasonCodes).toContain('UPSELL_OPPORTUNITY');
    });

    it('should not trigger if has security service', () => {
      const input: RecommendationInput = {
        churnProbability: 0.68,
        onlineSecurityService: true,
        techSupportService: false,
        monthlyCharges: 70,
      };

      const result = service.getRecommendation(input);

      expect(result.reasonCodes).not.toContain('HIGH_CHURN_NO_ADDONS');
    });

    it('should not trigger if has tech support service', () => {
      const input: RecommendationInput = {
        churnProbability: 0.68,
        onlineSecurityService: false,
        techSupportService: true,
        monthlyCharges: 70,
      };

      const result = service.getRecommendation(input);

      expect(result.reasonCodes).not.toContain('HIGH_CHURN_NO_ADDONS');
    });
  });

  describe('Rule 7: Moderate Month-to-Month (NORMAL)', () => {
    it('should return NORMAL for 50-75% churn with month-to-month contract', () => {
      const input: RecommendationInput = {
        churnProbability: 0.60,
        contract: 'Month-to-month',
        tenure: 18,
      };

      const result = service.getRecommendation(input);

      expect(result.priority).toBe('NORMAL');
      expect(result.reasonCodes).toContain('MODERATE_CHURN_MTM_CONTRACT');
    });
  });

  describe('Rule 8: General Moderate Churn (NORMAL)', () => {
    it('should return NORMAL for 50-70% churn', () => {
      const input: RecommendationInput = {
        churnProbability: 0.55,
        tenure: 24,
        contract: 'One year',
      };

      const result = service.getRecommendation(input);

      expect(result.priority).toBe('NORMAL');
      expect(result.reasonCodes).toContain('MODERATE_CHURN_RISK');
    });
  });

  describe('Rule 9: Monitor Month-to-Month (LOW)', () => {
    it('should return LOW for <=50% churn with month-to-month contract', () => {
      const input: RecommendationInput = {
        churnProbability: 0.45,
        contract: 'Month-to-month',
        tenure: 30,
      };

      const result = service.getRecommendation(input);

      expect(result.priority).toBe('LOW');
      expect(result.reasonCodes).toContain('LOW_CHURN_MTM_MONITOR');
    });
  });

  describe('Rule 10: Low Churn Satisfied (LOW)', () => {
    it('should return LOW for <=50% churn', () => {
      const input: RecommendationInput = {
        churnProbability: 0.30,
        tenure: 48,
        contract: 'Two year',
      };

      const result = service.getRecommendation(input);

      expect(result.priority).toBe('LOW');
      expect(result.reasonCodes).toContain('LOW_CHURN_SATISFIED');
    });
  });

  describe('getRiskLevel', () => {
    it('should return LOW for churn < 0.33', () => {
      const risk = service.getRiskLevel(0.25);
      expect(risk).toBe('LOW');
    });

    it('should return MEDIUM for 0.33 <= churn < 0.67', () => {
      const risk = service.getRiskLevel(0.50);
      expect(risk).toBe('MEDIUM');
    });

    it('should return HIGH for churn >= 0.67', () => {
      const risk = service.getRiskLevel(0.75);
      expect(risk).toBe('HIGH');
    });

    it('should return LOW at boundary 0.33', () => {
      const risk = service.getRiskLevel(0.33);
      expect(risk).toBe('MEDIUM');
    });

    it('should return HIGH at boundary 0.67', () => {
      const risk = service.getRiskLevel(0.67);
      expect(risk).toBe('HIGH');
    });
  });

  describe('getRulesSummary', () => {
    it('should return a summary string containing all rules', () => {
      const summary = service.getRulesSummary();

      expect(typeof summary).toBe('string');
      expect(summary).toContain('Rule Summary');
      expect(summary).toContain('RULE 1');
      expect(summary).toContain('RULE 10');
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimal input (only churnProbability)', () => {
      const input: RecommendationInput = {
        churnProbability: 0.45,
      };

      const result = service.getRecommendation(input);

      expect(result.recommendation).toBeDefined();
      expect(result.priority).toBeDefined();
      expect(result.reasonCodes.length).toBeGreaterThan(0);
    });

    it('should handle exact churn threshold boundaries', () => {
      const input1: RecommendationInput = {
        churnProbability: 0.5000001,
        contract: 'Month-to-month',
      };

      const result1 = service.getRecommendation(input1);
      expect(result1.priority).toBe('NORMAL');

      const input2: RecommendationInput = {
        churnProbability: 0.4999999,
        contract: 'Month-to-month',
      };

      const result2 = service.getRecommendation(input2);
      expect(result2.reasonCodes).toContain('LOW_CHURN_MTM_MONITOR');
    });

    it('should prioritize first matching rule (Rule 1 overrides others)', () => {
      const input: RecommendationInput = {
        churnProbability: 0.90,
        tenure: 3,
        contract: 'Month-to-month',
        monthlyCharges: 120,
        paymentMethod: 'Electronic check',
        onlineSecurityService: false,
        techSupportService: false,
      };

      const result = service.getRecommendation(input);

      // Should hit Rule 1 first (most urgent)
      expect(result.reasonCodes).toContain('CRITICAL_NEW_CUSTOMER');
      expect(result.priority).toBe('URGENT');
    });
  });
});
