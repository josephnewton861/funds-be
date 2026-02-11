import { Module } from '@nestjs/common';
import { FundsController } from './funds.controller';
import { FundsService } from './funds.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Fund } from './funds/entities/fund.entity';
import { Document } from './funds/entities/document.entity';
import { PortfolioAsset } from './funds/entities/portfolio-asset.entity';
import { TopHolding } from './funds/entities/holding.entity';
import { FundsModule } from './funds/funds.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Async config so we can read env vars
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),

        entities: [Fund, Document, PortfolioAsset, holdings],

        synchronize: true, // dev only
      }),
    }),
    FundsModule,
  ],
  controllers: [FundsController],
  providers: [FundsService],
})
export class AppModule {}
