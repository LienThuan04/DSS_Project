import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importFromCsv(@UploadedFile() file?: any, @Body() body?: any) {
    if (file) {
      // File upload from frontend
      if (!file.buffer) {
        throw new BadRequestException('Invalid file: no buffer found');
      }
      
      if (file.buffer.length === 0) {
        throw new BadRequestException('File is empty');
      }

      try {
        const csvText = file.buffer.toString('utf8');
        if (!csvText || csvText.trim() === '') {
          throw new BadRequestException('CSV file is empty or invalid');
        }
        
        const customers = await this.customersService.parseAndValidateCsv(csvText);
        const result = await this.customersService.importFromCsv(customers);
        return result;
      } catch (error: any) {
        if (error.message && error.message.includes('CSV')) {
          throw error;
        }
        throw new BadRequestException(`Error processing CSV: ${error.message}`);
      }
    } else if (body && Array.isArray(body)) {
      // Direct JSON array (legacy support)
      return this.customersService.importFromCsv(body);
    } else {
      throw new BadRequestException('Please provide either a CSV file or customer data');
    }
  }

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get('stats')
  stats() {
    return this.customersService.getStats();
  }

  @Get('by-id/:customerId')
  findByCustomerId(@Param('customerId') customerId: string) {
    return this.customersService.findByCustomerId(customerId);
  }

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
  ) {
    return this.customersService.findAll(page, limit, search);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.customersService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
