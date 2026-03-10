export interface Customer {
  _id?: string;
  customerID: string;
  gender?: string;
  SeniorCitizen?: number;
  Partner?: string;
  Dependents?: string;
  tenure?: number;
  PhoneService?: string;
  InternetService?: string;
  Contract?: string;
  PaymentMethod?: string;
  MonthlyCharges?: number;
  TotalCharges?: number;
  Churn?: string;
}

export interface Prediction {
  _id?: string;
  customerId: string;
  customerName?: string;
  churnProbability: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
  priority?: 'URGENT' | 'HIGH' | 'NORMAL';
  createdAt?: string;
  inputData?: Record<string, any>;
  status?: string;
}

export interface Stats {
  totalCustomers?: number;
  churned?: number;
  retained?: number;
  churnRate?: string;
  totalPredictions?: number;
  highRisk?: number;
  mediumRisk?: number;
  lowRisk?: number;
  failedPredictions?: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
}
