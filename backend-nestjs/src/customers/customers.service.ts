import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './schemas/customer.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';
import { ValidationService } from '../common/services/validation.service';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
    private validationService: ValidationService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const createdCustomer = new this.customerModel(createCustomerDto);
    return createdCustomer.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    search?: string,
  ): Promise<{ data: Customer[]; total: number; page: number; limit: number }> {
    let query = {};
    if (search) {
      query = {
        $or: [
          { customerID: { $regex: search, $options: 'i' } },
          { gender: { $regex: search, $options: 'i' } },
          { InternetService: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const total = await this.customerModel.countDocuments(query);
    const data = await this.customerModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ _id: -1 });

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.customerModel.findById(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async findByCustomerId(customerId: string): Promise<Customer> {
    const customer = await this.customerModel.findOne({ customerID: customerId });
    if (!customer) {
      throw new NotFoundException(`Customer with customerID ${customerId} not found`);
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const updatedCustomer = await this.customerModel.findByIdAndUpdate(
      id,
      updateCustomerDto,
      { new: true, runValidators: true },
    );
    if (!updatedCustomer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return updatedCustomer;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.customerModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return { message: `Customer ${id} deleted successfully` };
  }

  async importFromCsv(customers: CreateCustomerDto[]): Promise<{ 
    imported: number; 
    errors: any[];
    validationErrors: any[];
  }> {
    if (customers.length === 0) {
      return { imported: 0, errors: [], validationErrors: [] };
    }

    // Validate all records first
    const validationErrors: any[] = [];
    const validRecords: CreateCustomerDto[] = [];

    for (let i = 0; i < customers.length; i++) {
      const validationResult = this.validationService.validateRecord(customers[i], i + 2); // +2 because row 1 is header
      if (validationResult.valid === false) {
        validationErrors.push(validationResult.errors);
      } else {
        validRecords.push(customers[i]);
      }
    }

    // If all records are invalid, return early
    if (validRecords.length === 0) {
      return {
        imported: 0,
        errors: [],
        validationErrors,
      };
    }

    try {
      // Use insertMany for bulk insert (much faster than sequential inserts)
      const result = await this.customerModel.insertMany(validRecords, { ordered: false });
      return {
        imported: result.length,
        errors: [],
        validationErrors,
      };
    } catch (error: any) {
      // Handle partial insert errors
      if (error.code === 11000) {
        // Duplicate key error - some records were inserted
        const imported = error.result?.insertedIds?.length || 0;
        const duplicateErrors = error.writeErrors?.map((e: any) => ({
          customer: validRecords[e.index]?.customerID,
          error: 'Duplicate customer ID',
        })) || [];
        return {
          imported,
          errors: duplicateErrors,
          validationErrors,
        };
      }
      
      // Fall back to sequential insert for other errors
      const results = [];
      const dbErrors = [];

      for (const customer of validRecords) {
        try {
          const created = await this.create(customer);
          results.push(created);
        } catch (err: any) {
          dbErrors.push({
            customer: customer.customerID,
            error: err.message,
          });
        }
      }

      return {
        imported: results.length,
        errors: dbErrors,
        validationErrors,
      };
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    result.push(current.trim());
    return result;
  }

  async parseAndValidateCsv(csvText: string): Promise<CreateCustomerDto[]> {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new BadRequestException('CSV must contain at least a header and one data row');
    }

    // Parse header - handle quoted fields
    const headers = this.parseCSVLine(lines[0]);
    const customers: CreateCustomerDto[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') {
        continue; // Skip empty lines
      }

      const values = this.parseCSVLine(lines[i]);
      
      if (values.length !== headers.length) {
        console.warn(
          `Row ${i + 1} has ${values.length} columns but expected ${headers.length}, skipping`,
        );
        continue;
      }

      const customer: any = {};
      for (let j = 0; j < headers.length; j++) {
        const key = headers[j];
        let value: any = values[j];

        // Remove surrounding quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }

        // Type conversion
        if (value === '' || value === 'null' || value === 'undefined') {
          value = null;
        } else if (!isNaN(value) && value !== '' && value !== 'Yes' && value !== 'No') {
          value = Number(value);
        }

        customer[key] = value;
      }

      customers.push(customer as CreateCustomerDto);
    }

    if (customers.length === 0) {
      throw new BadRequestException('No valid customer records found in CSV');
    }

    return customers;
  }

  async getStats(): Promise<{
    totalCustomers: number;
    churned: number;
    retained: number;
    churnRate: string;
  }> {
    const total = await this.customerModel.countDocuments();
    const churned = await this.customerModel.countDocuments({ Churn: 'Yes' });
    const retained = total - churned;
    const churnRate = total > 0 ? ((churned / total) * 100).toFixed(2) : '0.00';

    return {
      totalCustomers: total,
      churned,
      retained,
      churnRate: `${churnRate}%`,
    };
  }

  async getSegmentedChurnStats(): Promise<{
    byContract: any[];
    byInternetService: any[];
    byPaymentMethod: any[];
  }> {
    // Churn by Contract
    const contractGroups = await this.customerModel.aggregate([
      {
        $group: {
          _id: '$Contract',
          total: { $sum: 1 },
          churned: {
            $sum: {
              $cond: [{ $eq: ['$Churn', 'Yes'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          total: 1,
          churned: 1,
          churnRate: {
            $cond: [
              { $eq: ['$total', 0] },
              0,
              { $multiply: [{ $divide: ['$churned', '$total'] }, 100] },
            ],
          },
        },
      },
      { $sort: { name: 1 } },
    ]);

    // Churn by Internet Service
    const internetGroups = await this.customerModel.aggregate([
      {
        $group: {
          _id: '$InternetService',
          total: { $sum: 1 },
          churned: {
            $sum: {
              $cond: [{ $eq: ['$Churn', 'Yes'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          total: 1,
          churned: 1,
          churnRate: {
            $cond: [
              { $eq: ['$total', 0] },
              0,
              { $multiply: [{ $divide: ['$churned', '$total'] }, 100] },
            ],
          },
        },
      },
      { $sort: { name: 1 } },
    ]);

    // Churn by Payment Method
    const paymentGroups = await this.customerModel.aggregate([
      {
        $group: {
          _id: '$PaymentMethod',
          total: { $sum: 1 },
          churned: {
            $sum: {
              $cond: [{ $eq: ['$Churn', 'Yes'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          total: 1,
          churned: 1,
          churnRate: {
            $cond: [
              { $eq: ['$total', 0] },
              0,
              { $multiply: [{ $divide: ['$churned', '$total'] }, 100] },
            ],
          },
        },
      },
      { $sort: { name: 1 } },
    ]);

    return {
      byContract: contractGroups || [],
      byInternetService: internetGroups || [],
      byPaymentMethod: paymentGroups || [],
    };
  }
}
