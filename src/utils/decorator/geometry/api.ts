import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger";

function __MakeApiProperty(opts: ApiPropertyOptions) {
    return function (options?: ApiPropertyOptions) {
        options && Object.assign(opts, options);
        return ApiProperty(opts);
    }
}

const __pointOpts = {
    type: 'array',
    items: { type: 'number', format: 'float' },
    minItems: 2,
    maxItems: 2,
    example: [127.0, 37.5],
};

const __lineOpts = {
    type: 'array',
    items: __pointOpts,
    example: [
        [127.0, 37.5],
        [127.1, 37.51],
        [127.2, 37.53],
    ]
};

const __polygonOpts = {
    type: 'array',
    items: __lineOpts,
    example: [
        [
            [127.0, 37.5],
            [127.1, 37.51],
            [127.2, 37.53],
        ],
        [
            [126.9, 37.49],
            [127.0, 37.50],
            [127.1, 37.52],
        ],
    ],
};

export const ApiPointProperty
    = __MakeApiProperty(__pointOpts as ApiPropertyOptions);

export const ApiLineProperty
    = __MakeApiProperty(__lineOpts as ApiPropertyOptions);

export const ApiPolygonProperty
    = __MakeApiProperty(__polygonOpts as ApiPropertyOptions);
