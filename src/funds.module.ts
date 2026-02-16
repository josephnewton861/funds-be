import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Funds } from './entities/funds.entity';
import { Documents } from './entities/documents.entity';
import { PortfolioAssets } from './entities/portfolioAssets.entity';
import { Holdings } from './entities/holdings.entity';
import { PreloadFundsService } from './services/preloadFunds.service';
import { FundsController } from './controllers/funds.controller';
import { AllFundsService } from './services/allFunds.service';
import { FundService } from './services/fund.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Funds, Documents, PortfolioAssets, Holdings]),
  ],
  controllers: [FundsController],
  exports: [PreloadFundsService],
  providers: [PreloadFundsService, AllFundsService, FundService],
})
export class FundsModule {}
