import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

import { Funds } from '../entities/funds.entity';
import { Documents } from '../entities/documents.entity';
import { Holdings } from '../entities/holdings.entity';
import { PortfolioAssets } from '../entities/portfolioAssets.entity';
import { FundsApiResponse } from '../interfaces/preload.interface';

@Injectable()
export class PreloadFundsService {
  private readonly logger = new Logger(PreloadFundsService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Funds) private fundsRepository: Repository<Funds>,
    @InjectRepository(Documents)
    private documentsRepository: Repository<Documents>,
    @InjectRepository(Holdings)
    private holdingsRepository: Repository<Holdings>,
    @InjectRepository(PortfolioAssets)
    private portfolioAssetsRepository: Repository<PortfolioAssets>,
  ) {}

  // Main function to preload multiple funds from configured endpoints
  async preloadFunds() {
    const baseUrl = this.config.get<string>('BASE_URL') ?? '';
    const endpoints = ['BYW8RV9', 'BYW8RX1', 'BYW8VG2', 'BN0S2V9'];

    for (const code of endpoints) {
      const url = `${baseUrl}/${code}.json`;
      try {
        const response = await axios.get<FundsApiResponse>(url);
        // safely get data even if response is undefined
        const data = response?.data;
        if (!data) {
          throw new Error('No data returned from API'); // avoid destructuring undefined
        }
        const transformed = this.transformApiData(data);

        const fund = await this.upsertFund(transformed.fund); // Insert or update fund

        // Sync related entities
        await this.syncDocuments(fund, transformed.documents);
        await this.syncHoldings(fund, transformed.holdings);
        await this.syncPortfolioAssets(fund, transformed.portfolioAssets);

        this.logger.log(`Preloaded fund ${fund.name}`);
      } catch (err) {
        this.logger.error(`Failed to load from ${url}`, err.message);
      }
    }

    return { status: 200, message: 'Funds preloaded successfully' };
  }

  // Insert new fund or update existing one
  private async upsertFund(fundData: Partial<Funds>): Promise<Funds> {
    let fund = await this.fundsRepository.findOne({
      where: { marketCode: fundData.marketCode },
      relations: ['documents', 'holdings', 'portfolioAssets'],
    });

    if (fund) {
      Object.assign(fund, fundData); // Update existing fields
      this.logger.log(`Updated fund ${fund.marketCode}`);
    } else {
      fund = this.fundsRepository.create(fundData); // Create new fund
      this.logger.log(`Inserted fund ${fund.marketCode}`);
    }

    return this.fundsRepository.save(fund);
  }

  // Sync documents: insert new or update existing
  private async syncDocuments(
    fund: Funds,
    docs: { type: string | null; url: string }[],
  ) {
    for (const doc of docs) {
      const existing = fund.documents?.find((d) => d.url === doc.url);
      if (existing) {
        existing.type = doc.type;
        await this.documentsRepository.save(existing);
      } else {
        await this.documentsRepository.save(
          this.documentsRepository.create({ ...doc, fund }),
        );
      }
    }
  }

  // Sync holdings: insert new or update existing
  private async syncHoldings(
    fund: Funds,
    holdings: { name: string; weighting: number | null }[],
  ) {
    for (const holding of holdings) {
      const existing = fund.holdings?.find((h) => h.name === holding.name);
      if (existing) {
        existing.weighting = holding.weighting ?? 0;
        await this.holdingsRepository.save(existing);
      } else {
        await this.holdingsRepository.save(
          this.holdingsRepository.create({
            fund,
            name: holding.name,
            weighting: holding.weighting ?? undefined, // undefined lets TypeORM handle nullable
          }),
        );
      }
    }
  }

  // Sync portfolio assets: insert new or update existing
  private async syncPortfolioAssets(
    fund: Funds,
    assets: { label: string; value: number }[],
  ) {
    for (const asset of assets) {
      const existing = fund.portfolioAssets?.find(
        (a) => a.label === asset.label,
      );
      if (existing) {
        existing.value = asset.value;
        await this.portfolioAssetsRepository.save(existing);
      } else {
        await this.portfolioAssetsRepository.save(
          this.portfolioAssetsRepository.create({ ...asset, fund }),
        );
      }
    }
  }

  // Transform API response into strongly typed fund and related entities
  private transformApiData(api: FundsApiResponse) {
    const quote = api.data?.quote ?? {};
    const ratings = api.data?.ratings ?? {};
    const docs = api.data?.documents ?? [];
    const portfolio = api.data?.portfolio ?? {};
    const holdings = portfolio.top10Holdings ?? [];
    const assets = portfolio.asset ?? [];
    const profile = api.data?.profile ?? {};

    return {
      fund: {
        name: quote.name ?? '',
        marketCode: quote.marketCode ?? '',
        lastPrice: quote.lastPrice ?? null,
        lastPriceDate: quote.lastPriceDate
          ? isNaN(Date.parse(quote.lastPriceDate))
            ? null
            : new Date(quote.lastPriceDate) // convert string to Date
          : null,
        ongoingCharge: quote.ongoingCharge ?? 0,
        sectorName: quote.sectorName ?? null,
        currency: quote.currency ?? '',
        objective: profile.objective ?? null,
        analystRating: ratings.analystRating ?? 0,
        srri: ratings.SRRI ?? null,
        analystRatingLabel: ratings.analystRatingLabel ?? null,
      },

      documents: docs
        .filter((d) => d.url)
        .map((d) => ({
          type: d.type ?? null,
          url: d.url!,
        })),

      holdings: holdings
        .filter((h) => h.name)
        .map((h) => ({
          name: h.name!,
          weighting: h.weighting ?? null,
        })),

      portfolioAssets: assets
        .filter((a) => a.label)
        .map((a) => ({
          label: a.label!,
          value: a.value ?? 0,
        })),
    };
  }
}
