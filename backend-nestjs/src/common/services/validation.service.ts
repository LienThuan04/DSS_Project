import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface SchemaProperty {
  type: string;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  description?: string;
}

interface InputSchema {
  required: string[];
  properties: {
    [key: string]: SchemaProperty;
  };
}

interface RowError {
  row: number;
  customer?: string;
  errors: {
    field: string;
    error: string;
  }[];
}

@Injectable()
export class ValidationService {
  private schema: InputSchema | null = null;

  constructor() {
    this.loadSchema();
  }

  private loadSchema() {
    try {
      const schemaPath = path.join(
        process.cwd(),
        'ml-python',
        'input_schema.json',
      );
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
      const parsed = JSON.parse(schemaContent);
      this.schema = {
        required: parsed.required || [],
        properties: parsed.properties || {},
      };
    } catch (error) {
      console.warn('Could not load input schema, using defaults:', error);
      // Provide default schema if file not found
      this.schema = this.getDefaultSchema();
    }
  }

  private getDefaultSchema(): InputSchema {
    return {
      required: [
        'gender',
        'SeniorCitizen',
        'Partner',
        'Dependents',
        'tenure',
        'PhoneService',
        'MultipleLines',
        'InternetService',
        'OnlineSecurity',
        'OnlineBackup',
        'DeviceProtection',
        'TechSupport',
        'StreamingTV',
        'StreamingMovies',
        'Contract',
        'PaperlessBilling',
        'PaymentMethod',
        'MonthlyCharges',
        'TotalCharges',
      ],
      properties: {
        gender: { type: 'string', enum: ['Male', 'Female'] },
        SeniorCitizen: { type: 'integer', enum: [0, 1] },
        Partner: { type: 'string', enum: ['Yes', 'No'] },
        Dependents: { type: 'string', enum: ['Yes', 'No'] },
        tenure: { type: 'integer', minimum: 0, maximum: 72 },
        PhoneService: { type: 'string', enum: ['Yes', 'No'] },
        MultipleLines: { type: 'string', enum: ['Yes', 'No', 'No phone service'] },
        InternetService: { type: 'string', enum: ['DSL', 'Fiber optic', 'No'] },
        OnlineSecurity: {
          type: 'string',
          enum: ['Yes', 'No', 'No internet service'],
        },
        OnlineBackup: {
          type: 'string',
          enum: ['Yes', 'No', 'No internet service'],
        },
        DeviceProtection: {
          type: 'string',
          enum: ['Yes', 'No', 'No internet service'],
        },
        TechSupport: {
          type: 'string',
          enum: ['Yes', 'No', 'No internet service'],
        },
        StreamingTV: {
          type: 'string',
          enum: ['Yes', 'No', 'No internet service'],
        },
        StreamingMovies: {
          type: 'string',
          enum: ['Yes', 'No', 'No internet service'],
        },
        Contract: {
          type: 'string',
          enum: ['Month-to-month', 'One year', 'Two year'],
        },
        PaperlessBilling: { type: 'string', enum: ['Yes', 'No'] },
        PaymentMethod: {
          type: 'string',
          enum: [
            'Electronic check',
            'Mailed check',
            'Bank transfer (automatic)',
            'Credit card (automatic)',
          ],
        },
        MonthlyCharges: { type: 'number', minimum: 0 },
        TotalCharges: { type: 'number', minimum: 0 },
        customerID: { type: 'string' },
      },
    };
  }

  validateRecord(
    record: any,
    rowNumber: number,
  ): { valid: true } | { valid: false; errors: RowError } {
    if (!this.schema) {
      return { valid: true };
    }

    const errors: { field: string; error: string }[] = [];

    // Check required fields
    for (const requiredField of this.schema.required) {
      const value = record[requiredField];
      if (value === null || value === undefined || value === '') {
        errors.push({
          field: requiredField,
          error: `Required field missing`,
        });
      }
    }

    // Validate each property
    for (const [field, value] of Object.entries(record)) {
      if (value === null || value === undefined || value === '') {
        continue; // Already checked in required fields
      }

      const propertySchema = this.schema.properties[field];
      if (!propertySchema) {
        // Unknown field - skip or warn
        continue;
      }

      const fieldErrors = this.validateField(field, value, propertySchema);
      errors.push(...fieldErrors);
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors: {
          row: rowNumber,
          customer: record.customerID,
          errors,
        },
      };
    }

    return { valid: true };
  }

  private validateField(
    fieldName: string,
    value: any,
    schema: SchemaProperty,
  ): { field: string; error: string }[] {
    const errors: { field: string; error: string }[] = [];

    // Type validation
    if (schema.type === 'integer') {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push({
          field: fieldName,
          error: `Expected integer, got "${value}"`,
        });
        return errors;
      }
      if (!Number.isInteger(num)) {
        errors.push({
          field: fieldName,
          error: `Expected integer, got decimal "${value}"`,
        });
        return errors;
      }
      value = num;
    } else if (schema.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push({
          field: fieldName,
          error: `Expected number, got "${value}"`,
        });
        return errors;
      }
      value = num;
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push({
        field: fieldName,
        error: `Invalid value "${value}". Allowed: ${schema.enum.join(', ')}`,
      });
    }

    // Range validation
    if (schema.minimum !== undefined && Number(value) < schema.minimum) {
      errors.push({
        field: fieldName,
        error: `Value ${value} is below minimum (${schema.minimum})`,
      });
    }
    if (schema.maximum !== undefined && Number(value) > schema.maximum) {
      errors.push({
        field: fieldName,
        error: `Value ${value} is above maximum (${schema.maximum})`,
      });
    }

    return errors;
  }
}
