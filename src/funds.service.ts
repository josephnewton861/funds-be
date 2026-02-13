import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Funds } from './entities/funds.entity';
import { Documents } from './entities/documents.entity';
import { Holdings } from './entities/holdings.entity';
import { PortfolioAssets } from './entities/portfolioAssets.entity';
import axios from 'axios';

@Injectable()
export class FundsService {
  private readonly logger = new Logger(FundsService.name);

  constructor(
    @InjectRepository(Funds) private fundsRepository: Repository<Funds>,
    @InjectRepository(Documents)
    private documentsRepository: Repository<Documents>,
    @InjectRepository(Holdings)
    private holdingsRepository: Repository<Holdings>,
    @InjectRepository(PortfolioAssets)
    private portfolioAssetsRepository: Repository<PortfolioAssets>,
  ) {}

  async preloadFunds() {
    const apiEndpoints = [
      'https://cdn.core3-dev.ajbbuild.uk/interview/BYW8RV9.json',
      'https://cdn.core3-dev.ajbbuild.uk/interview/BYW8RX1.json',
      'https://cdn.core3-dev.ajbbuild.uk/interview/BYW8VG2.json',
      'https://cdn.core3-dev.ajbbuild.uk/interview/BN0S2V9.json',
    ];

    for (const url of apiEndpoints) {
      try {
        const { data } = await axios.get(url);

        this.logger.log(`Fetched data from ${url}`);

        const { fundsData, documents, holdings, portfolioAssets } =
          this.transformApiData(data);

        let fund = await this.fundsRepository.findOne({
          where: { marketCode: fundsData.marketCode },
          relations: ['documents', 'holdings', 'portfolioAssets'],
        });

        if (fund) {
          fund.lastPrice = fundsData.lastPrice;
          fund.lastPriceDate = fundsData.lastPriceDate;
          fund.ongoingCharge = fundsData.ongoingCharge;
          fund.sectorName = fundsData.sectorName;
          fund.currency = fundsData.currency;
          fund.objective = fundsData.objective;
          fund.analystRating = fundsData.analystRating;
          fund.srri = fundsData.srri;
          fund.analystRatingLabel = fundsData.analystRatingLabel;

          fund = await this.fundsRepository.save(fund);
          this.logger.log(`Updated fund ${fund.marketCode}`);
        } else {
          fund = this.fundsRepository.create(fundsData);
          fund = await this.fundsRepository.save(fund);
          this.logger.log(`Inserted fund ${fund.marketCode}`);
        }

        // Documents

        if (Array.isArray(documents)) {
          for (const doc of documents) {
            const existing = fund.documents?.find((d) => d.url === doc.url);

            if (existing) {
              existing.type = doc.type;
              await this.documentsRepository.save(existing);
            } else {
              const created = this.documentsRepository.create({
                type: doc.type,
                url: doc.url,
                fund,
              });

              await this.documentsRepository.save(created);
            }
          }
        }

        // Holdings

        if (Array.isArray(holdings)) {
          for (const holding of holdings) {
            const existing = fund.holdings?.find(
              (h) => h.name === holding.name,
            );

            if (existing) {
              existing.weighting = holding.weighting;

              await this.holdingsRepository.save(existing);
            } else {
              const created = this.holdingsRepository.create({
                name: holding.name,
                weighting: holding.weighting,
                fund,
              });

              await this.holdingsRepository.save(created);
            }
          }
        }

        // Portfolio assets

        if (Array.isArray(portfolioAssets)) {
          for (const asset of portfolioAssets) {
            const existing = fund.portfolioAssets?.find(
              (a) => a.label === asset.label,
            );

            if (existing) {
              existing.value = asset.value;

              await this.portfolioAssetsRepository.save(existing);
            } else {
              const created = this.portfolioAssetsRepository.create({
                label: asset.label,
                value: asset.value,
                fund,
              });

              await this.portfolioAssetsRepository.save(created);
            }
          }
        }

        this.logger.log(`Preloaded fund: ${fundsData.name}`);
      } catch (err) {
        this.logger.error(`Failed to load from ${url}`, err.message);
      }
    }
    return { status: 200, message: 'Funds preloaded successfully' };
  }

  private transformApiData(apiData: any) {
    const quote = apiData?.data?.quote ?? {};
    const ratingsData = apiData?.data?.ratings ?? {};
    const docsData = apiData?.data?.documents ?? [];
    const portfolioData = apiData?.data?.portfolio ?? {};
    const holdingsData = portfolioData.top10Holdings ?? [];
    const assetsData = portfolioData.asset ?? [];
    const performance = apiData?.data?.profile ?? {};

    return {
      fundsData: {
        name: quote.name,
        marketCode: quote.marketCode,
        lastPrice: quote.lastPrice ?? null,
        lastPriceDate: quote.lastPriceDate ?? null,
        ongoingCharge: quote.ongoingCharge ?? null,
        sectorName: quote.sectorName ?? null,
        currency: quote.currency ?? null,
        objective: performance.objective ?? null,
        analystRating: ratingsData.analystRating ?? null,
        srri: ratingsData.SRRI ?? null,
        analystRatingLabel: ratingsData.analystRatingLabel ?? null,
      },
      documents: docsData.map((doc: any) => ({
        title: doc.title,
        url: doc.url,
        type: doc.type ?? null,
      })),
      holdings: holdingsData.map((h: any) => ({
        name: h.name ?? null,
        weighting: h.weighting ?? null,
      })),
      portfolioAssets: assetsData.map((pa: any) => ({
        label: pa.label ?? null,
        value: pa.value ?? null,
      })),
    };
  }
}
