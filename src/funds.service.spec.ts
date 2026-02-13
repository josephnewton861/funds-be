import { Test, TestingModule } from '@nestjs/testing';
import { FundsService } from './funds.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Funds } from './entities/funds.entity';
import { Documents } from './entities/documents.entity';
import { Holdings } from './entities/holdings.entity';
import { PortfolioAssets } from './entities/portfolioAssets.entity';
import axios from 'axios';

jest.mock('axios');

describe('FundsService', () => {
  let service: FundsService;

  const axiosGetMock = axios.get as jest.Mock;

  // Factory for repository mocks
  const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  });

  // Hold references to mocks for assertions
  let mockFundsRepo: any;
  let mockDocsRepo: any;
  let mockHoldingsRepo: any;
  let mockAssetsRepo: any;

  beforeEach(async () => {
    mockFundsRepo = mockRepository();
    mockDocsRepo = mockRepository();
    mockHoldingsRepo = mockRepository();
    mockAssetsRepo = mockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundsService,
        { provide: getRepositoryToken(Funds), useValue: mockFundsRepo },
        { provide: getRepositoryToken(Documents), useValue: mockDocsRepo },
        { provide: getRepositoryToken(Holdings), useValue: mockHoldingsRepo },
        {
          provide: getRepositoryToken(PortfolioAssets),
          useValue: mockAssetsRepo,
        },
      ],
    }).compile();

    service = module.get<FundsService>(FundsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper to mock Axios GET responses safely
  const mockAxiosGet = (payload: any) => {
    axiosGetMock.mockResolvedValueOnce({ data: payload });
  };

  it('should preload funds successfully', async () => {
    // Mock API response
    mockAxiosGet({
      quote: {
        name: 'Fund A',
        marketCode: 'FUND:A',
        lastPrice: 1.23,
        lastPriceDate: '2026-02-13',
        ongoingCharge: 0.5,
        sectorName: 'Tech',
        currency: 'GBP',
      },
      profile: { objective: 'Growth' },
      documents: [{ title: 'Doc1', url: 'url1' }],
      portfolio: {
        top10Holdings: [{ name: 'Holding1', percentage: 50 }],
        assets: [{ name: 'Asset1', weight: 100 }],
      },
    });

    const savedFund = { id: 1, name: 'Fund A', marketCode: 'FUND:A' };
    mockFundsRepo.save.mockResolvedValueOnce(savedFund);
    mockDocsRepo.save.mockResolvedValueOnce([]);
    mockHoldingsRepo.save.mockResolvedValueOnce([]);
    mockAssetsRepo.save.mockResolvedValueOnce([]);

    const result = await service.preloadFunds();

    expect(result).toEqual({
      status: 200,
      message: 'Funds preloaded successfully',
    });

    expect(axiosGetMock).toHaveBeenCalled();
    expect(mockFundsRepo.save).toHaveBeenCalled();
    expect(mockDocsRepo.save).toHaveBeenCalled();
    expect(mockHoldingsRepo.save).toHaveBeenCalled();
    expect(mockAssetsRepo.save).toHaveBeenCalled();
  });

  it('should handle axios errors gracefully', async () => {
    // Axios rejects (simulate API error)
    axiosGetMock.mockRejectedValueOnce(new Error('API error'));

    const result = await service.preloadFunds();

    expect(result).toEqual({
      status: 200,
      message: 'Funds preloaded successfully',
    });

    expect(axiosGetMock).toHaveBeenCalled();
    expect(mockFundsRepo.save).not.toHaveBeenCalled();
    expect(mockDocsRepo.save).not.toHaveBeenCalled();
    expect(mockHoldingsRepo.save).not.toHaveBeenCalled();
    expect(mockAssetsRepo.save).not.toHaveBeenCalled();
  });

  it('should handle empty data safely', async () => {
    // Axios resolves but returns undefined
    axiosGetMock.mockResolvedValueOnce(undefined);

    const result = await service.preloadFunds();

    expect(result).toEqual({
      status: 200,
      message: 'Funds preloaded successfully',
    });

    // No repository calls should happen
    expect(mockFundsRepo.save).not.toHaveBeenCalled();
    expect(mockDocsRepo.save).not.toHaveBeenCalled();
    expect(mockHoldingsRepo.save).not.toHaveBeenCalled();
    expect(mockAssetsRepo.save).not.toHaveBeenCalled();
  });
});
