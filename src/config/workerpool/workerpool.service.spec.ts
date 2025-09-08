import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { WorkerPoolService } from "./workerpool.service";
import { Pool } from "workerpool";

jest.mock("workerpool", () => ({
    pool: jest.fn()
}));

describe(WorkerPoolService.name, () => {
    let service: WorkerPoolService;
    let configService: jest.Mocked<ConfigService>;
    let mockPool: jest.Mocked<Pool>;

    beforeEach(async () => {
        const { pool } = jest.requireMock("workerpool");
        
        mockPool = {
            exec: jest.fn(),
            terminate: jest.fn(),
            stats: jest.fn(),
        } as any;
        
        pool.mockReturnValue(mockPool);

        const module: TestingModule = await Test
            .createTestingModule({
                providers: [
                    WorkerPoolService,
                    {
                        provide: ConfigService,
                        useValue: {
                            get: jest.fn()
                        }
                    }
                ]
            }).compile();

        service = module.get(WorkerPoolService);
        configService = module.get(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create pool with default values when config values are not set', () => {
        const { pool } = jest.requireMock("workerpool");
        
        configService.get.mockReturnValue(undefined);

        new WorkerPoolService(configService);

        expect(pool).toHaveBeenCalledWith({
            workerType: "thread",
            maxWorkers: 10,
            maxQueueSize: 30
        });
    });

    it('should create pool with config values when they are set', () => {
        const { pool } = jest.requireMock("workerpool");
        
        configService.get
            .mockReturnValueOnce(15) // POOL_MAX_WORKERS
            .mockReturnValueOnce(50); // POOL_MAX_QUEUE_SIZE

        new WorkerPoolService(configService);

        expect(pool).toHaveBeenCalledWith({
            workerType: "thread",
            maxWorkers: 15,
            maxQueueSize: 50
        });
    });

    it('should execute function through pool.exec', async () => {
        const mockFunction = (a: number, b: number) => a + b;
        const expectedResult = 5;
        
        mockPool.exec.mockResolvedValue(expectedResult);

        const result = await service.exec(mockFunction, 2, 3);

        expect(mockPool.exec).toHaveBeenCalledWith(mockFunction, [2, 3]);
        expect(result).toBe(expectedResult);
    });

    it('should execute async function through pool.exec', async () => {
        const mockAsyncFunction = async (value: string) => `processed: ${value}`;
        const expectedResult = "processed: test";
        
        mockPool.exec.mockResolvedValue(expectedResult);

        const result = await service.exec(mockAsyncFunction, "test");

        expect(mockPool.exec).toHaveBeenCalledWith(mockAsyncFunction, ["test"]);
        expect(result).toBe(expectedResult);
    });

    it('should execute function with no arguments', async () => {
        const mockFunction = () => "hello world";
        const expectedResult = "hello world";
        
        mockPool.exec.mockResolvedValue(expectedResult);

        const result = await service.exec(mockFunction);

        expect(mockPool.exec).toHaveBeenCalledWith(mockFunction, []);
        expect(result).toBe(expectedResult);
    });

    it('should propagate errors from pool.exec', async () => {
        const mockFunction = () => { throw new Error('Worker error'); };
        const error = new Error('Worker execution failed');
        
        mockPool.exec.mockRejectedValue(error);

        await expect(service.exec(mockFunction)).rejects.toThrow(error);
    });

    it('should terminate pool on module destroy', async () => {
        mockPool.terminate.mockResolvedValue(undefined);

        await service.onModuleDestroy();

        expect(mockPool.terminate).toHaveBeenCalledWith(true);
    });

    it('should handle terminate errors gracefully', async () => {
        const error = new Error('Termination failed');
        mockPool.terminate.mockRejectedValue(error);

        await expect(service.onModuleDestroy()).rejects.toThrow(error);
    });
});