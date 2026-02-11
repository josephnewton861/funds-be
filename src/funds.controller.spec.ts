import { Test, TestingModule } from '@nestjs/testing';
import { FundsController } from './funds.controller';
import { FundsService } from './funds.service';

describe('FundsController', () => {
  let fundsController: FundsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FundsController],
      providers: [FundsService],
    }).compile();

    fundsController = app.get<FundsController>(FundsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(fundsController.getHello()).toBe('Hello World!');
    });
  });
});
