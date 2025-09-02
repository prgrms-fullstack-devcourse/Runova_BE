import { Test, TestingModule } from '@nestjs/testing';
import { CacheInterceptor } from './cache.interceptor';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { plainToInstance } from 'class-transformer';

jest.mock('class-transformer', () => ({
  plainToInstance: jest.fn(),
}));

describe('HttpCacheInterceptor', () => {
  let interceptor: CacheInterceptor;
  let cacheManager: any;
  let reflector: Reflector;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockRequest: any;

  beforeEach(async () => {
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const mockReflector = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheInterceptor,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    interceptor = module.get<CacheInterceptor>(CacheInterceptor);
    cacheManager = module.get(CACHE_MANAGER);
    reflector = module.get<Reflector>(Reflector);

    mockRequest = {
      method: 'GET',
      originalUrl: '/test/path',
      locals: {},
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getHandler: jest.fn(),
    } as any;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of('response data')),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should return next.handle() when no cache key is generated', async () => {
      jest.spyOn(interceptor as any, 'trackBy').mockReturnValue(undefined);
      reflector.get = jest.fn().mockReturnValue({ ttl: 60 });

      const result = await interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(result).toBe(mockCallHandler.handle());
      expect(cacheManager.get).not.toHaveBeenCalled();
    });

    it('should return next.handle() when no caching options are found', async () => {
      jest.spyOn(interceptor as any, 'trackBy').mockReturnValue('/test/path');
      reflector.get = jest.fn().mockReturnValue(null);

      const result = await interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(result).toBe(mockCallHandler.handle());
      expect(cacheManager.get).not.toHaveBeenCalled();
    });

    it('should set cached data to req.locals when cache hit occurs', async () => {
      const cachedData = { id: 1, name: 'test' };
      const options = { ttl: 60 };

      jest.spyOn(interceptor as any, 'trackBy').mockReturnValue('/test/path');
      reflector.get = jest.fn().mockReturnValue(options);
      cacheManager.get = jest.fn().mockResolvedValue(cachedData);

      await interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(cacheManager.get).toHaveBeenCalledWith('/test/path');
      expect(mockRequest.cached).toBe(cachedData);
    });

    it('should transform cached data using schema when provided', async () => {
      const cachedData = { id: 1, name: 'test' };
      const transformedData = { id: 1, name: 'test', transformed: true };
      const schema = class TestSchema {};
      const options = { ttl: 60, schema };

      jest.spyOn(interceptor as any, 'trackBy').mockReturnValue('/test/path');
      reflector.get = jest.fn().mockReturnValue(options);
      cacheManager.get = jest.fn().mockResolvedValue(cachedData);
      (plainToInstance as jest.Mock).mockReturnValue(transformedData);

      await interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(plainToInstance).toHaveBeenCalledWith(schema, cachedData);
      expect(mockRequest.cached).toBe(transformedData);
    });

    it('should set undefined to req.locals.data when no cache hit and no schema', async () => {
      const options = { ttl: 60 };

      jest.spyOn(interceptor as any, 'trackBy').mockReturnValue('/test/path');
      reflector.get = jest.fn().mockReturnValue(options);
      cacheManager.get = jest.fn().mockResolvedValue(undefined);

      await interceptor.intercept(mockExecutionContext, mockCallHandler);

      expect(mockRequest.cached).toBeUndefined();
    });

    it('should cache response data when cache miss occurs', async () => {
      const responseData = { id: 1, name: 'response' };
      const options = { ttl: 60 };

      jest.spyOn(interceptor as any, 'trackBy').mockReturnValue('/test/path');
      reflector.get = jest.fn().mockReturnValue(options);
      cacheManager.get = jest.fn().mockResolvedValue(undefined);
      cacheManager.set = jest.fn().mockResolvedValue(undefined);
      mockCallHandler.handle = jest.fn().mockReturnValue(of(responseData));

      const result$ = await interceptor.intercept(mockExecutionContext, mockCallHandler);
      
      result$.subscribe(() => {
        setTimeout(() => {
          expect(cacheManager.set).toHaveBeenCalledWith('/test/path', responseData, 60);
        }, 0);
      });
    });

    it('should handle cache set errors gracefully', async () => {
      const responseData = { id: 1, name: 'response' };
      const options = { ttl: 60 };
      const loggerSpy = jest.spyOn(interceptor['logger'], 'error').mockImplementation();

      jest.spyOn(interceptor as any, 'trackBy').mockReturnValue('/test/path');
      reflector.get = jest.fn().mockReturnValue(options);
      cacheManager.get = jest.fn().mockResolvedValue(undefined);
      cacheManager.set = jest.fn().mockRejectedValue(new Error('Cache error'));
      mockCallHandler.handle = jest.fn().mockReturnValue(of(responseData));

      const result$ = await interceptor.intercept(mockExecutionContext, mockCallHandler);
      
      result$.subscribe(() => {
        setTimeout(() => {
          expect(loggerSpy).toHaveBeenCalledWith(new Error('Cache error'));
        }, 0);
      });
    });

    it('should not cache when cached data already exists', async () => {
      const cachedData = { id: 1, name: 'cached' };
      const responseData = { id: 2, name: 'response' };
      const options = { ttl: 60 };

      jest.spyOn(interceptor as any, 'trackBy').mockReturnValue('/test/path');
      reflector.get = jest.fn().mockReturnValue(options);
      cacheManager.get = jest.fn().mockResolvedValue(cachedData);
      mockCallHandler.handle = jest.fn().mockReturnValue(of(responseData));

      const result$ = await interceptor.intercept(mockExecutionContext, mockCallHandler);
      
      result$.subscribe(() => {
        setTimeout(() => {
          expect(cacheManager.set).not.toHaveBeenCalled();
        }, 0);
      });
    });
  });

  describe('trackBy', () => {
    it('should return originalUrl for GET requests', () => {
      mockRequest.method = 'GET';
      mockRequest.originalUrl = '/api/test';

      const result = interceptor['trackBy'](mockExecutionContext);

      expect(result).toBe('/api/test');
    });

    it('should return undefined for non-GET requests', () => {
      mockRequest.method = 'POST';
      mockRequest.originalUrl = '/api/test';

      const result = interceptor['trackBy'](mockExecutionContext);

      expect(result).toBeUndefined();
    });

    it('should return undefined for PUT requests', () => {
      mockRequest.method = 'PUT';
      mockRequest.originalUrl = '/api/test';

      const result = interceptor['trackBy'](mockExecutionContext);

      expect(result).toBeUndefined();
    });

    it('should return undefined for DELETE requests', () => {
      mockRequest.method = 'DELETE';
      mockRequest.originalUrl = '/api/test';

      const result = interceptor['trackBy'](mockExecutionContext);

      expect(result).toBeUndefined();
    });
  });
});