import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PredictionsService } from './predictions.service';
import { PredictionsController } from './predictions.controller';
import { Prediction, PredictionSchema } from './schemas/prediction.schema';
import { MlService } from '../common/services/ml.service';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prediction.name, schema: PredictionSchema },
    ]),
    CustomersModule,
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService, MlService],
})
export class PredictionsModule {}
