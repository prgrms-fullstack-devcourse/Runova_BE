import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger";

export type ApiGeometricPropertyOptions = Omit<
    ApiPropertyOptions,
    "type" | "items" | "maxItems" | "minItems" | "isArray"
>;

function __MakeGeometricProperty(opts: ApiPropertyOptions) {
    return function (options?: ApiGeometricPropertyOptions) {
        options && Object.assign(opts, options);
        return ApiProperty(opts);
    }
}

const __posOpts = {
    type: 'array',
    items: { type: 'number', format: 'float' },
    minItems: 2,
    maxItems: 2,
    example: [127.0, 37.5],
};

const __lineOpts = {
    type: 'array',
    items: __posOpts,
    minItems: 2,
    example: [
        [127.0, 37.5],
        [127.1, 37.51],
        [127.2, 37.53],
    ],
};

const __shapeOpts = {
    type: 'array',
    items: __lineOpts,
    minItems: 3,
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

const ApiPositionProperty = __MakeGeometricProperty(
    __posOpts as ApiPropertyOptions,
);

export const ApiLineProperty = __MakeGeometricProperty(
    __lineOpts as ApiPropertyOptions,
);

export const ApiShapeProperty = __MakeGeometricProperty(
    __shapeOpts as ApiPropertyOptions,
);