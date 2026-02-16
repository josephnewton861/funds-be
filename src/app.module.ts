import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Funds } from './entities/funds.entity';
import { Documents } from './entities/documents.entity';
import { PortfolioAssets } from './entities/portfolioAssets.entity';
import { Holdings } from './entities/holdings.entity';
import { FundsModule } from './funds.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // DB set up
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        ssl: {
          rejectUnauthorized: false,
        },

        entities: [Funds, Documents, PortfolioAssets, Holdings],

        synchronize: true,
      }),
    }),
    FundsModule,
  ],
})
export class AppModule {}
