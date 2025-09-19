import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RandomArtUrlService } from './random.art.url.service';
import { RunningRecord } from '../../modules/running';

describe('RandomArtUrlService', () => {
  let service: RandomArtUrlService;
  let repository: jest.Mocked<Repository<RunningRecord>>;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RandomArtUrlService,
        {
          provide: getRepositoryToken(RunningRecord),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RandomArtUrlService>(RandomArtUrlService);
    repository = module.get(getRepositoryToken(RunningRecord));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('pickRandomArtUrl', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should return null when no records exist for user', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.pickRandomArtUrl(1);

      expect(result).toBeNull();
      expect(repository.find).toHaveBeenCalledWith({
        select: ['id', 'userId', 'artUrl'],
        where: { userId: 1 },
      });
    });

    it('should return the only artUrl when user has single record', async () => {
      const mockRecord = { id: 1, userId: 1, artUrl: 'test-art-url' };
      repository.find.mockResolvedValue([mockRecord as RunningRecord]);

      const result = await service.pickRandomArtUrl(1);

      expect(result).toBe('test-art-url');
      expect(repository.find).toHaveBeenCalledWith({
        select: ['id', 'userId', 'artUrl'],
        where: { userId: 1 },
      });
    });

    it('should return one of the artUrls when user has multiple records', async () => {
      const mockRecords = [
        { id: 1, userId: 1, artUrl: 'art-url-1' },
        { id: 2, userId: 1, artUrl: 'art-url-2' },
        { id: 3, userId: 1, artUrl: 'art-url-3' },
      ];
      repository.find.mockResolvedValue(mockRecords as RunningRecord[]);

      const result = await service.pickRandomArtUrl(1);

      expect(['art-url-1', 'art-url-2', 'art-url-3']).toContain(result);
    });

    it('should handle userId 0 (edge case)', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.pickRandomArtUrl(0);

      expect(result).toBeNull();
      expect(repository.find).toHaveBeenCalledWith({
        select: ['id', 'userId', 'artUrl'],
        where: { userId: 0 },
      });
    });

    it('should handle negative userId (edge case)', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.pickRandomArtUrl(-1);

      expect(result).toBeNull();
      expect(repository.find).toHaveBeenCalledWith({
        select: ['id', 'userId', 'artUrl'],
        where: { userId: -1 },
      });
    });

    it('should handle very large userId (edge case)', async () => {
      const largeUserId = Number.MAX_SAFE_INTEGER;
      repository.find.mockResolvedValue([]);

      const result = await service.pickRandomArtUrl(largeUserId);

      expect(result).toBeNull();
      expect(repository.find).toHaveBeenCalledWith({
        select: ['id', 'userId', 'artUrl'],
        where: { userId: largeUserId },
      });
    });

    it('should handle empty string artUrl (edge case)', async () => {
      const mockRecord = { id: 1, userId: 1, artUrl: '' };
      repository.find.mockResolvedValue([mockRecord as RunningRecord]);

      const result = await service.pickRandomArtUrl(1);

      expect(result).toBe('');
    });

    it('should handle null artUrl (edge case)', async () => {
      const mockRecord = { id: 1, userId: 1, artUrl: null };
      repository.find.mockResolvedValue([mockRecord as unknown as RunningRecord]);

      const result = await service.pickRandomArtUrl(1);

      expect(result).toBeNull();
    });

    it('should handle very long artUrl (edge case)', async () => {
      const longUrl = 'a'.repeat(10000);
      const mockRecord = { id: 1, userId: 1, artUrl: longUrl };
      repository.find.mockResolvedValue([mockRecord as unknown as RunningRecord]);

      const result = await service.pickRandomArtUrl(1);

      expect(result).toBe(longUrl);
    });

    it('should handle special characters in artUrl (edge case)', async () => {
      const specialUrl = 'https://example.com/art?id=123&param=value#fragment';
      const mockRecord = { id: 1, userId: 1, artUrl: specialUrl };
      repository.find.mockResolvedValue([mockRecord as unknown as RunningRecord]);

      const result = await service.pickRandomArtUrl(1);

      expect(result).toBe(specialUrl);
    });

    it('should handle unicode characters in artUrl (edge case)', async () => {
      const unicodeUrl = 'https://example.com/アート/絵画';
      const mockRecord = { id: 1, userId: 1, artUrl: unicodeUrl };
      repository.find.mockResolvedValue([mockRecord as unknown as RunningRecord]);

      const result = await service.pickRandomArtUrl(1);

      expect(result).toBe(unicodeUrl);
    });

    it('should handle database error gracefully', async () => {
      repository.find.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.pickRandomArtUrl(1)).rejects.toThrow('Database connection failed');
    });

    it('should verify randomness distribution over multiple calls', async () => {
      const mockRecords = [
        { id: 1, userId: 1, artUrl: 'url-1' },
        { id: 2, userId: 1, artUrl: 'url-2' },
        { id: 3, userId: 1, artUrl: 'url-3' },
        { id: 4, userId: 1, artUrl: 'url-4' },
        { id: 5, userId: 1, artUrl: 'url-5' },
      ];
      repository.find.mockResolvedValue(mockRecords as RunningRecord[]);

      const results: string[] = [];
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const result = await service.pickRandomArtUrl(1);
        results.push(result!);
      }

      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);

      for (const url of uniqueResults) {
        expect(['url-1', 'url-2', 'url-3', 'url-4', 'url-5']).toContain(url);
      }
    });

    it('should handle large number of records efficiently', async () => {
      const largeRecordSet = Array.from({ length: 10000 }, (_, i) => ({
        id: i + 1,
        userId: 1,
        artUrl: `art-url-${i + 1}`,
      }));
      repository.find.mockResolvedValue(largeRecordSet as RunningRecord[]);

      const start = Date.now();
      const result = await service.pickRandomArtUrl(1);
      const end = Date.now();

      expect(result).toMatch(/^art-url-\d+$/);
      expect(end - start).toBeLessThan(100);
    });

    it('should handle records with mixed artUrl types', async () => {
      const mockRecords = [
        { id: 1, userId: 1, artUrl: 'valid-url' },
        { id: 2, userId: 1, artUrl: '' },
        { id: 3, userId: 1, artUrl: null },
        { id: 4, userId: 1, artUrl: 'another-valid-url' },
      ];
      repository.find.mockResolvedValue(mockRecords as RunningRecord[]);

      const results: (string | null)[] = [];
      for (let i = 0; i < 20; i++) {
        const result = await service.pickRandomArtUrl(1);
        results.push(result);
      }

      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
      expect(Array.from(uniqueResults)).toEqual(
        expect.arrayContaining(['valid-url', '', null, 'another-valid-url'])
      );
    });
  });
});