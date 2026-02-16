import { Test, TestingModule } from '@nestjs/testing';
import { FundsController } from '../controllers/funds.controller';
import { PreloadFundsService } from '../services/preloadFunds.service';
import { AllFundsService } from '../services/allFunds.service';
import { FundService } from '../services/fund.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('FundsController', () => {
  let controller: FundsController;
  let preloadService: PreloadFundsService;
  let allFundsService: AllFundsService;
  let fundService: FundService;

  // Mock services with jest.fn()
  const mockPreloadService = { preloadFunds: jest.fn() };
  const mockAllFundsService = { getAllFunds: jest.fn() };
  const mockFundService = { getFund: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FundsController],
      providers: [
        { provide: PreloadFundsService, useValue: mockPreloadService },
        { provide: AllFundsService, useValue: mockAllFundsService },
        { provide: FundService, useValue: mockFundService },
      ],
    }).compile();

    controller = module.get<FundsController>(FundsController);
    preloadService = module.get<PreloadFundsService>(PreloadFundsService);
    allFundsService = module.get<AllFundsService>(AllFundsService);
    fundService = module.get<FundService>(FundService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks between tests
  });

  // Preload route tests
  it('should call preloadFunds and return the result successfully', async () => {
    const mockResult = { status: 200, message: 'Funds preloaded successfully' };
    mockPreloadService.preloadFunds.mockResolvedValue(mockResult);

    const result = await controller.preloadFunds();

    expect(preloadService.preloadFunds).toHaveBeenCalled();
    expect(result).toEqual(mockResult);
  });

  it('should throw InternalServerErrorException if preloadFunds fails', async () => {
    mockPreloadService.preloadFunds.mockRejectedValue(new Error('API error'));

    await expect(controller.preloadFunds()).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(preloadService.preloadFunds).toHaveBeenCalled();
  });

  // Funds route tests
  it('should call allFundsService.getAllFunds and return funds', async () => {
    const mockFunds = [
      { id: 1, name: 'Fund A' },
      { id: 2, name: 'Fund B' },
    ];
    mockAllFundsService.getAllFunds.mockResolvedValue(mockFunds);

    const result = await controller.loadFunds();

    expect(allFundsService.getAllFunds).toHaveBeenCalled();
    expect(result).toEqual(mockFunds);
  });

  it('should throw InternalServerErrorException if getAllFunds fails', async () => {
    mockAllFundsService.getAllFunds.mockRejectedValue(new Error('DB error'));

    await expect(controller.loadFunds()).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(allFundsService.getAllFunds).toHaveBeenCalled();
  });

  // funds/:id route tests
  it('should call fundService.getFund with the correct ID and return the fund', async () => {
    const mockFund = { id: 1, name: 'Fund A' };
    mockFundService.getFund.mockResolvedValue(mockFund);

    const result = await controller.loadFundById({ id: '1' });

    expect(fundService.getFund).toHaveBeenCalledWith(1); // ID is parsed as integer
    expect(result).toEqual(mockFund);
  });

  it('should throw InternalServerErrorException if getFund fails', async () => {
    mockFundService.getFund.mockRejectedValue(new Error('DB error'));

    await expect(controller.loadFundById({ id: '1' })).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(fundService.getFund).toHaveBeenCalledWith(1);
  });

  it('should handle invalid numeric string IDs gracefully', async () => {
    // Simulate invalid ID input; parseInt returns NaN
    mockFundService.getFund.mockResolvedValue(null);

    await expect(controller.loadFundById({ id: 'abc' })).resolves.toBeNull();
    expect(fundService.getFund).toHaveBeenCalledWith(NaN); // still called with NaN
  });
});
