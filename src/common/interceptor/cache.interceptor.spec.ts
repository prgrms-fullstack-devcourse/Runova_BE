import { CacheInterceptor } from "./cache.interceptor";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { firstValueFrom, of } from "rxjs";
import { MD5 } from "object-hash";

const __BASE_URL = "https://test.com";

const makeExecutionContext = (
    method: "GET" | "POST" | "PUT" | "PATCH" |"DELETE",
    path: string,
): ExecutionContext => {
    const url = new URL(`${__BASE_URL}${path}`);

    const req = {
        method,
        originalUrl: path,
        path: url.pathname,
        query: Object.fromEntries(url.searchParams.entries())
    };

    return {
      switchToHttp: () => ({
          getRequest: <T = any>() => req as T,
      }) as HttpArgumentsHost,
      getHandler: () => {},
    } as ExecutionContext;
};

describe(CacheInterceptor.name, () => {
    let interceptor: CacheInterceptor;
    let reflector: jest.Mocked<Reflector>;
    let __storage: object;

    beforeEach(async () => {

        const module: TestingModule = await Test
            .createTestingModule({
                providers: [
                    CacheInterceptor,
                    {
                        provide: CACHE_MANAGER,
                        useValue: {
                            get: jest.fn().mockImplementation(async (key: string) =>
                                __storage[key]
                            ),
                            set: jest.fn().mockImplementation(
                                async (key: string, value: any, _?: number) => {
                                    __storage[key] = value;
                                }
                            )
                        }
                    },
                    {
                        provide: Reflector,
                        useValue: { get: jest.fn() }
                    }
                ]
            }).compile();

        interceptor = module.get(CacheInterceptor);
        reflector = module.get(Reflector);
        __storage = {};
    });

    it('should cache value when no cached value exists', async () => {
        const mockPath = "/test";
        const ctx = makeExecutionContext("GET", mockPath);
        const expectedKey = mockPath + '?' + MD5({});
        const handler: CallHandler = { handle: () => of({ foo: 1 }) };

        reflector.get.mockReturnValue({ ttl: 3600 });

        const result$ = await interceptor.intercept(ctx, handler);
        const data = await firstValueFrom(result$);
        expect(data).toEqual(__storage[expectedKey]);
    });

    it('should determine existence of cache value regardless of order of query parameters', async () => {
        const mockPath = "/test";
        const mockQs1 = "a=1&b=2&c=3";
        const mockQs2 = "b=2&c=3&a=1";
        const mockData = { foo: 1, bar: 2 };

        const ctx1 = makeExecutionContext(
            "GET",
            [mockPath, mockQs1].join('?')
        );

        const ctx2 = makeExecutionContext(
            "GET",
            [mockPath, mockQs2].join('?')
        );

        const handler: CallHandler = { handle: () => of(mockData) };
        reflector.get.mockReturnValue({});

        const result1$ = await interceptor.intercept(ctx1, handler);
        const data1 = await firstValueFrom(result1$);

        const result2$ = await interceptor.intercept(ctx2, handler);
        const data2 = await firstValueFrom(result2$);

        expect(ctx2.switchToHttp().getRequest().cached)
            .toEqual(data1);

        expect(ctx2.switchToHttp().getRequest().cached)
            .toEqual(data2);
    })


})