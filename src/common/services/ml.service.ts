import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class MlService {
  private readonly logger = new Logger(MlService.name);
  private axiosInstance: AxiosInstance;
  private mlApiUrl: string;

  constructor(private configService: ConfigService) {
    this.mlApiUrl = configService.get<string>('ML_API_URL') || 'http://localhost:5000';
    this.axiosInstance = axios.create({
      baseURL: this.mlApiUrl,
      timeout: 30000,
    });
  }

  async predict(data: Record<string, any>): Promise<{
    success: boolean;
    churnProbability?: number;
    riskLevel?: string;
    recommendation?: string;
    priority?: string;
    topFactors?: Array<{ feature: string; value: string | number; impact: number }>;
    error?: string;
  }> {
    try {
      this.logger.debug(`Calling ML API at ${this.mlApiUrl} with data:`, data);

      const response = await this.axiosInstance.post('/predict', data);

      if (response.data.success) {
        return {
          success: true,
          churnProbability: response.data.churn_probability,
          riskLevel: response.data.risk_level,
          recommendation: response.data.recommendation,
          priority: response.data.priority,
          topFactors: response.data.top_factors || [],
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Unknown prediction error',
        };
      }
    } catch (error) {
      this.logger.error(`ML API Error: ${error.message}`);

      throw new ServiceUnavailableException(
        `ML API unavailable at ${this.mlApiUrl}. ` +
          `Start Python API: python ml-python/predict_api.py. ` +
          `Error: ${error.message}`,
      );
    }
  }

  async health(): Promise<{
    healthy: boolean;
    modelLoaded?: boolean;
    scalerLoaded?: boolean;
    error?: string;
  }> {
    try {
      const response = await this.axiosInstance.get('/health');
      return {
        healthy: response.data.status === 'ok',
        modelLoaded: response.data.model_loaded,
        scalerLoaded: response.data.scaler_loaded,
      };
    } catch (error) {
      return {
        healthy: false,
        error: `ML API health check failed: ${error.message}`,
      };
    }
  }
}
