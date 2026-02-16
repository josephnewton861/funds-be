import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm'; // DeepPartial is the correct type for mocked entities
import { AllFundsService } from '../services/allFunds.service';
import { Funds } from '../entities/funds.entity';

describe('AllFundsService', () => {
  let service: AllFundsService;
  let repository: jest.Mocked<Repository<Funds>>;

  // Mock funds interface
  const mockFunds: DeepPartial<Funds>[] = [
    {
      id: 1,
      name: 'Global Equity',
      marketCode: 'VGEQ',
      lastPrice: 182.34,
      lastPriceDate: '2025-10-12',
      ongoingCharge: 0.22,
      sectorName: 'Global Large-Cap Blend Equity',
      currency: 'GBP',
      objective:
        'The Fund seeks to provide long-term capital growth by investing in global equities.',
      analystRating: 4,
      srri: 5,
      analystRatingLabel: 'Neutral',
    },
    {
      id: 2,
      name: 'iShares Corporate Bond Index',
      marketCode: 'ICBI',
      lastPrice: 104.91,
      lastPriceDate: '2025-10-11',
      ongoingCharge: 0.12,
      sectorName: 'Sterling Corporate Bond',
      currency: 'GBP',
      objective:
        'Tracks the performance of an index composed of investment-grade corporate bonds.',
      analystRating: 3,
      srri: 3,
      analystRatingLabel: 'Bronze',
    },
  ];

  const repositoryMock = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllFundsService,
        {
          // This replaces the real TypeORM repository with our mock
          provide: getRepositoryToken(Funds),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<AllFundsService>(AllFundsService);
    repository = module.get(getRepositoryToken(Funds));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFunds', () => {
    it('should return all funds from the repository', async () => {
      repository.find.mockResolvedValue(mockFunds as Funds[]);

      const result = await service.getAllFunds();

      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith(); // ensures no joins/options added
      expect(result).toEqual(mockFunds);
    });

    it('should return an empty array when no funds exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.getAllFunds();

      expect(result).toEqual([]);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('should behave as a thin data layer (no transformations)', async () => {
      repository.find.mockResolvedValue(mockFunds as Funds[]);

      const result = await service.getAllFunds();

      // These checks ensure no accidental mapping logic is introduced later
      expect(result[0].name).toBe('Global Equity');
      expect(result[0].marketCode).toBe('VGEQ');
      expect(result[0].analystRatingLabel).toBe('Neutral');
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database failure');
      repository.find.mockRejectedValue(error);

      // Service should have infrastructure errors
      await expect(service.getAllFunds()).rejects.toThrow('Database failure');
    });
  });
});
