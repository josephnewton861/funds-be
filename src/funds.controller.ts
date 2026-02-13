import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { FundsService } from './funds.service';

@Controller('funds')
export class FundsController {
  constructor(private readonly fundsService: FundsService) {}

  @Get('preload')
  async preloadFunds(): Promise<{ status: any }> {
    try {
      const preloadRes = await this.fundsService.preloadFunds();
      return preloadRes;
    } catch (err) {
      throw new InternalServerErrorException('Failed to preload funds');
    }
  }
}
