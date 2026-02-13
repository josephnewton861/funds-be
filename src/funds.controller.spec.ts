import { Test, TestingModule } from '@nestjs/testing';
import { FundsController } from './funds.controller';
import { FundsService } from './funds.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('FundsController', () => {
  let controller: FundsController;
  let service: FundsService;

  const mockFundsService = {
    preloadFunds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FundsController],
      providers: [
        {
          provide: FundsService,
          useValue: mockFundsService,
        },
      ],
    }).compile();

    controller = module.get<FundsController>(FundsController);
    service = module.get<FundsService>(FundsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('Calls preloadFunds function successfully and return the result', async () => {
    const mockResult = { status: 200, message: 'Funds preloaded successfully' };
    mockFundsService.preloadFunds.mockResolvedValue(mockResult);

    const result = await controller.preloadFunds();

    expect(service.preloadFunds).toHaveBeenCalled();
    expect(result).toEqual(mockResult);
  });
  it('Calls preloadFunds and throws InternalServerErrorException if service fails', async () => {
    mockFundsService.preloadFunds.mockRejectedValue(new Error('API error'));

    await expect(controller.preloadFunds()).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(service.preloadFunds).toHaveBeenCalled();
  });
});
