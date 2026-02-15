import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Funds } from './entities/funds.entity';

@Injectable()
export class FundService {
  constructor(
    @InjectRepository(Funds)
    private readonly fundsRepository: Repository<Funds>,
  ) {}

  async getFund(id?: number) {
    // Fetch all funds and join the related tables
    const fund = await this.fundsRepository.findOne({
      where: { id },
      relations: ['documents', 'holdings', 'portfolioAssets'],
    });
    return fund;
  }
}
