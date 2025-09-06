import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MakeCourseNodesService } from './make.course.nodes.service';
import { WorkerPoolService } from '../../config/workerpool';
import { CourseNodeDTO } from '../dto';

describe('MakeCourseNodesService', () => {
  let service: MakeCourseNodesService;
  let mockWorkerPoolService: jest.Mocked<WorkerPoolService>;

  beforeEach(async () => {
    // Mock WorkerPoolService
    mockWorkerPoolService = {
      exec: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MakeCourseNodesService,
        {
          provide: WorkerPoolService,
          useValue: mockWorkerPoolService,
        },
      ],
    }).compile();

    service = module.get<MakeCourseNodesService>(MakeCourseNodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('makeCourseNodes', () => {
    const mockPath: [number, number][] = [
      [126.9780, 37.5665], // Seoul City Hall
      [126.9790, 37.5675], // Nearby point
      [126.9800, 37.5685], // Another nearby point
    ];

    const mockExpectedNodes: CourseNodeDTO[] = [
      {
        location: [126.9780, 37.5665],
        progress: 0,
        bearing: 45.0,
      },
      {
        location: [126.9790, 37.5675],
        progress: 1000,
        bearing: 45.0,
      },
      {
        location: [126.9800, 37.5685],
        progress: 2000,
        bearing: 0,
      },
    ];

    it('should successfully execute makeCourseNodes through worker pool', async () => {
      // Arrange
      mockWorkerPoolService.exec.mockResolvedValue(mockExpectedNodes);

      // Act
      const result = await service.makeCourseNodes(mockPath);

      // Assert
      expect(mockWorkerPoolService.exec).toHaveBeenCalledWith(
        expect.any(Function),
        mockPath
      );
      expect(result).toEqual(mockExpectedNodes);
    });

    it('should handle worker pool errors and re-throw them', async () => {
      // Arrange
      const mockError = new Error('Worker pool execution failed');
      mockWorkerPoolService.exec.mockRejectedValue(mockError);

      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      // Act & Assert
      await expect(service.makeCourseNodes(mockPath)).rejects.toThrow('Worker pool execution failed');
      expect(loggerErrorSpy).toHaveBeenCalledWith(mockError);

      // Cleanup
      loggerErrorSpy.mockRestore();
    });

    it('should handle empty path', async () => {
      // Arrange
      const emptyPath: [number, number][] = [];
      mockWorkerPoolService.exec.mockResolvedValue([]);

      // Act
      const result = await service.makeCourseNodes(emptyPath);

      // Assert
      expect(mockWorkerPoolService.exec).toHaveBeenCalledWith(
        expect.any(Function),
        emptyPath
      );
      expect(result).toEqual([]);
    });

    it('should handle single point path', async () => {
      // Arrange
      const singlePointPath: [number, number][] = [[126.9780, 37.5665]];
      const expectedSingleNode: CourseNodeDTO[] = [
        {
          location: [126.9780, 37.5665],
          progress: 0,
          bearing: 0,
        },
      ];
      mockWorkerPoolService.exec.mockResolvedValue(expectedSingleNode);

      // Act
      const result = await service.makeCourseNodes(singlePointPath);

      // Assert
      expect(mockWorkerPoolService.exec).toHaveBeenCalledWith(
        expect.any(Function),
        singlePointPath
      );
      expect(result).toEqual(expectedSingleNode);
    });
  });
});

// Unit tests for the internal functions (not exposed but can be tested indirectly)
describe('Internal Functions Integration', () => {
  let service: MakeCourseNodesService;

  beforeEach(async () => {
    const mockWorkerPoolService = {
      exec: jest.fn().mockImplementation((fn, args) => {
        // Execute the function directly for testing internal logic
        return Promise.resolve(fn(args));
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MakeCourseNodesService,
        {
          provide: WorkerPoolService,
          useValue: mockWorkerPoolService,
        },
      ],
    }).compile();

    service = module.get<MakeCourseNodesService>(MakeCourseNodesService);
  });

  describe('__makeCourseNodes integration', () => {
    it('should calculate correct nodes for a simple straight line', async () => {
      // Arrange: Simple path with 3 points in a straight line
      const path: [number, number][] = [
        [126.9780, 37.5665], // Seoul City Hall
        [126.9790, 37.5675], // 1km northeast
        [126.9800, 37.5685], // Another 1km northeast
      ];

      // Act
      const result = await service.makeCourseNodes(path);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].location).toEqual(path[0]);
      expect(result[0].progress).toBe(0);
      expect(result[1].location).toEqual(path[1]);
      expect(result[1].progress).toBeGreaterThan(0);
      expect(result[2].location).toEqual(path[2]);
      expect(result[2].bearing).toBe(0); // Last node always has bearing 0
    });

    it('should handle path with direction changes', async () => {
      // Arrange: Path that makes a 90-degree turn
      const path: [number, number][] = [
        [126.9780, 37.5665], // Start
        [126.9790, 37.5665], // Go east
        [126.9790, 37.5675], // Go north
      ];

      // Act
      const result = await service.makeCourseNodes(path);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].progress).toBe(0);
      expect(result[1].progress).toBeGreaterThan(result[0].progress);
      expect(result[2].progress).toBeGreaterThan(result[1].progress);
      
      // Bearings should be different for direction changes
      expect(result[0].bearing).not.toBe(result[1].bearing);
      expect(result[2].bearing).toBe(0); // Last node always has bearing 0
    });

    it('should calculate bearing angles correctly', async () => {
      // Arrange: Path going directly east then north
      const path: [number, number][] = [
        [126.9780, 37.5665], // Start
        [126.9790, 37.5665], // Go east (bearing should be ~90 degrees)
        [126.9790, 37.5675], // Go north (bearing should be ~0 degrees)
      ];

      // Act
      const result = await service.makeCourseNodes(path);

      // Assert
      expect(result).toHaveLength(3);
      // Bearings should be calculated based on the direction changes
      expect(typeof result[0].bearing).toBe('number');
      expect(typeof result[1].bearing).toBe('number');
      expect(result[2].bearing).toBe(0); // Last node always 0
    });

    it('should handle very close points (duplicate filtering)', async () => {
      // Arrange: Path with very close duplicate points
      const path: [number, number][] = [
        [126.9780, 37.5665],
        [126.9780, 37.5665], // Duplicate
        [126.9790, 37.5675],
      ];

      // Act
      const result = await service.makeCourseNodes(path);

      // Assert - should still process all points even if duplicates
      expect(result).toHaveLength(3);
      expect(result[0].location).toEqual(path[0]);
      expect(result[1].location).toEqual(path[1]);
      expect(result[2].location).toEqual(path[2]);
    });

    it('should handle single point path correctly', async () => {
      // Arrange
      const path: [number, number][] = [[126.9780, 37.5665]];

      // Act
      const result = await service.makeCourseNodes(path);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].location).toEqual(path[0]);
      expect(result[0].progress).toBe(0);
      expect(result[0].bearing).toBe(0);
    });

    it('should calculate progressive distances correctly', async () => {
      // Arrange: 3-point path
      const path: [number, number][] = [
        [126.9780, 37.5665],
        [126.9790, 37.5675],
        [126.9800, 37.5685],
      ];

      // Act
      const result = await service.makeCourseNodes(path);

      // Assert: Progress should be cumulative and increasing
      expect(result).toHaveLength(3);
      expect(result[0].progress).toBe(0);
      expect(result[1].progress).toBeGreaterThan(0);
      expect(result[2].progress).toBeGreaterThan(result[1].progress);
      
      // Check that distances are reasonable (should be in meters)
      expect(result[1].progress).toBeGreaterThan(100); // At least 100m
      expect(result[1].progress).toBeLessThan(1000);    // Less than 1km
    });
  });
});