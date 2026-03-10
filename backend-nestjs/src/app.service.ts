import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {
      message: 'Customer Churn Decision Support System (DSS)',
      version: '1.0.0',
      endpoints: {
        health: 'GET /health',
        customers: {
          list: 'GET /customers',
          get: 'GET /customers/:id',
          create: 'POST /customers',
          update: 'PUT /customers/:id',
          delete: 'DELETE /customers/:id',
        },
        predictions: {
          list: 'GET /predictions',
          get: 'GET /predictions/:id',
          create: 'POST /predictions',
          byCustomer: 'POST /predictions/customer/:customerId',
          highRisk: 'GET /predictions/high-risk',
        },
      },
    };
  }
}
