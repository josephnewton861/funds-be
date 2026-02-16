import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Funds } from '../entities/funds.entity';

@Injectable()
export class AllFundsService {
  constructor(
    @InjectRepository(Funds)
    private readonly fundsRepository: Repository<Funds>,
  ) {}

  async getAllFunds() {
    // Fetch all fund data without joining the related tables to improve performance
    const funds = await this.fundsRepository.find();
    return funds;
  }
}
