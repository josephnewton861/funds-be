import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Funds } from './entities/funds.entity';
import { Documents } from './entities/documents.entity';
import { PortfolioAssets } from './entities/portfolioAssets.entity';
import { Holdings } from './entities/holdings.entity';
import { FundsService } from './funds.service';
import { FundsController } from './funds.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Funds, Documents, PortfolioAssets, Holdings]),
  ],
  controllers: [FundsController],
  exports: [FundsService],
  providers: [FundsService],
})
export class FundsModule {}
