import { Test, TestingModule } from '@nestjs/testing';
import { PreloadFundsService } from '../services/preloadFunds.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Funds } from '../entities/funds.entity';
import { Documents } from '../entities/documents.entity';
import { Holdings } from '../entities/holdings.entity';
import { PortfolioAssets } from '../entities/portfolioAssets.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

jest.mock('axios');

describe('PreloadFundsService', () => {
  let service: PreloadFundsService;

  const axiosGetMock = axios.get as jest.Mock;

  // Factory for simple repository mocks
  const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn((dto) => dto),
  });

  // Hold references to repository mocks
  let mockFundsRepo: any;
  let mockDocsRepo: any;
  let mockHoldingsRepo: any;
  let mockAssetsRepo: any;

  // Mock ConfigService to provide BASE_URL
  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'BASE_URL') return 'http://mockapi.com';
      return null;
    }),
  };

  beforeEach(async () => {
    mockFundsRepo = mockRepository();
    mockDocsRepo = mockRepository();
    mockHoldingsRepo = mockRepository();
    mockAssetsRepo = mockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreloadFundsService,
        { provide: ConfigService, useValue: mockConfigService }, // Inject mock ConfigService
        { provide: getRepositoryToken(Funds), useValue: mockFundsRepo },
        { provide: getRepositoryToken(Documents), useValue: mockDocsRepo },
        { provide: getRepositoryToken(Holdings), useValue: mockHoldingsRepo },
        {
          provide: getRepositoryToken(PortfolioAssets),
          useValue: mockAssetsRepo,
        },
      ],
    }).compile();

    service = module.get<PreloadFundsService>(PreloadFundsService);
    jest.spyOn(service['logger'], 'log').mockImplementation(() => {});
    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
  });

  // reset mocks between tests
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper to mock Axios GET responses
  const mockAxiosGet = (payload: any) => {
    axiosGetMock.mockResolvedValueOnce({ data: payload });
  };

  it('should preload funds successfully', async () => {
    // Mock a realistic API response
    mockAxiosGet({
      data: {
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
        documents: [{ title: 'Doc1', url: 'url1', type: 'PDF' }],
        portfolio: {
          top10Holdings: [{ name: 'Holding1', weighting: 50 }],
          asset: [{ label: 'Asset1', value: 100 }],
        },
        ratings: { analystRating: 5, SRRI: 3, analystRatingLabel: 'Moderate' },
      },
    });

    // Mock repository save responses
    const savedFund = {
      id: 1,
      name: 'Fund A',
      marketCode: 'FUND:A',
      documents: [],
      holdings: [],
      portfolioAssets: [],
    };
    mockFundsRepo.save.mockResolvedValueOnce(savedFund);
    mockDocsRepo.save.mockResolvedValueOnce([]);
    mockHoldingsRepo.save.mockResolvedValueOnce([]);
    mockAssetsRepo.save.mockResolvedValueOnce([]);

    const result = await service.preloadFunds();

    expect(result).toEqual({
      status: 200,
      message: 'Funds preloaded successfully',
    });

    // Check that Axios was called and repositories were used
    expect(axiosGetMock).toHaveBeenCalled();
    expect(mockFundsRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Fund A' }),
    );
    expect(mockDocsRepo.save).toHaveBeenCalled();
    expect(mockHoldingsRepo.save).toHaveBeenCalled();
    expect(mockAssetsRepo.save).toHaveBeenCalled();
  });

  it('should handle axios errors gracefully', async () => {
    axiosGetMock.mockRejectedValueOnce(new Error('API error')); // simulate API failure

    const result = await service.preloadFunds();

    expect(result).toEqual({
      status: 200,
      message: 'Funds preloaded successfully',
    });

    // Repositories should not be called when API fails
    expect(mockFundsRepo.save).not.toHaveBeenCalled();
    expect(mockDocsRepo.save).not.toHaveBeenCalled();
    expect(mockHoldingsRepo.save).not.toHaveBeenCalled();
    expect(mockAssetsRepo.save).not.toHaveBeenCalled();
  });

  it('should handle empty API data safely', async () => {
    mockAxiosGet(undefined); // simulate API returning nothing

    const result = await service.preloadFunds();

    expect(result).toEqual({
      status: 200,
      message: 'Funds preloaded successfully',
    });

    // No saves should happen with empty data
    expect(mockFundsRepo.save).not.toHaveBeenCalled();
    expect(mockDocsRepo.save).not.toHaveBeenCalled();
    expect(mockHoldingsRepo.save).not.toHaveBeenCalled();
    expect(mockAssetsRepo.save).not.toHaveBeenCalled();
  });

  it('should handle null and undefined fields correctly', async () => {
    mockAxiosGet({
      data: {
        quote: {
          name: 'Fund B',
          marketCode: 'FUND:B',
          lastPrice: null,
          lastPriceDate: null,
          ongoingCharge: null,
          sectorName: null,
          currency: 'USD',
        },
        profile: {},
        documents: [],
        portfolio: {},
        ratings: {},
      },
    });

    const savedFund = {
      id: 2,
      name: 'Fund B',
      marketCode: 'FUND:B',
      documents: [],
      holdings: [],
      portfolioAssets: [],
    };
    mockFundsRepo.save.mockResolvedValueOnce(savedFund);

    const result = await service.preloadFunds();

    expect(result).toEqual({
      status: 200,
      message: 'Funds preloaded successfully',
    });

    // Check nullable fields handled correctly
    expect(mockFundsRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Fund B',
        lastPrice: null,
        lastPriceDate: null,
      }),
    );
  });
});
