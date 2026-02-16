import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { FundService } from '../services/fund.service';
import { Funds } from '../entities/funds.entity';

describe('FundService', () => {
  let service: FundService;
  let repository: jest.Mocked<Repository<Funds>>;

  const mockFund: DeepPartial<Funds> = {
    id: 1,
    name: 'Vanguard Global Equity',
    marketCode: 'VGEQ',
    lastPrice: 182.34,

    // Mocked relations (lightweight — no entity construction needed)
    documents: [
      { id: 10, type: 'factsheet.pdf' },
      { id: 11, type: 'kiid.pdf' },
    ],
    holdings: [
      { id: 100, name: 'Apple Inc.', weighting: 4.5 },
      { id: 101, name: 'Microsoft Corp.', weighting: 4.2 },
    ],
    portfolioAssets: [
      { id: 200, label: 'Equity', value: 92 },
      { id: 201, label: 'Cash', value: 8 },
    ],
  };

  const repositoryMock = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundService,
        {
          provide: getRepositoryToken(Funds),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<FundService>(FundService);
    repository = module.get(getRepositoryToken(Funds));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFund', () => {
    it('should fetch a fund by id including relations', async () => {
      repository.findOne.mockResolvedValue(mockFund as Funds);

      const result = await service.getFund(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['documents', 'holdings', 'portfolioAssets'],
      });

      expect(result).toEqual(mockFund);
    });

    it('should return null when fund is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.getFund(999);

      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should pass undefined id through to the repository', async () => {
      repository.findOne.mockResolvedValue(null);

      await service.getFund(undefined);

      // Verifies current behaviour (even if later you decide to guard against this)
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: undefined },
        relations: ['documents', 'holdings', 'portfolioAssets'],
      });
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database error');
      repository.findOne.mockRejectedValue(error);

      await expect(service.getFund(1)).rejects.toThrow('Database error');
    });
  });
});
