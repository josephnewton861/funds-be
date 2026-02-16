import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { PreloadFundsService } from '../services/preloadFunds.service';
import { AllFundsService } from '../services/allFunds.service';
import { FundService } from '../services/fund.service';

@Controller('')
export class FundsController {
  constructor(
    private readonly preloadFundsService: PreloadFundsService,
    private readonly allFundsService: AllFundsService,
    private readonly fundService: FundService,
  ) {}

  @Get('/preload')
  async preloadFunds(): Promise<{ status: any }> {
    try {
      const preloadRes = await this.preloadFundsService.preloadFunds();
      return preloadRes;
    } catch (err) {
      throw new InternalServerErrorException('Failed to preload funds');
    }
  }

  @Get('/funds')
  async loadFunds() {
    try {
      const funds = await this.allFundsService.getAllFunds();
      return funds;
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch funds');
    }
  }

  @Get('/funds/:id')
  async loadFundById(@Param() params: { id: string }) {
    try {
      const id = parseInt(params.id, 10);
      const fund = await this.fundService.getFund(id);
      return fund;
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch fund by ID');
    }
  }
}
