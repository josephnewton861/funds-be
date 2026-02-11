import { Controller, Get } from '@nestjs/common';
import { FundsService } from './funds.service';

@Controller()
export class FundsController {
  constructor(private readonly fundsService: FundsService) {}

  @Get()
  getHello(): string {
    return this.fundsService.getHello();
  }
}
