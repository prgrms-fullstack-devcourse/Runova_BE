import 'reflect-metadata';
import { validateSync } from 'class-validator';
import { IsPoint, IsLine, IsPolygon } from './validator'; // <- adjust path if needed

class PointDto {
    @IsPoint()
    point!: unknown;
}

class LineDto {
    @IsLine()
    line!: unknown;
}

class PolygonDto {
    @IsPolygon()
    polygon!: unknown;
}

function isValid(instance: object) {
    return validateSync(instance).length === 0;
}

describe('Custom geo validators', () => {
    describe('IsPoint', () => {
        it('accepts valid [lon, lat]', () => {
            const dto = new PointDto();
            dto.point = [127.1, 37.5];
            expect(isValid(dto)).toBe(true);
        });

        it('rejects non-array', () => {
            const dto = new PointDto();
            dto.point = 'not-an-array';
            expect(isValid(dto)).toBe(false);
        });

        it('rejects wrong length', () => {
            const dto = new PointDto();
            // length 3
            dto.point = [127.1, 37.5, 1];
            expect(isValid(dto)).toBe(false);
        });

        it('rejects out-of-range lon', () => {
            const dto = new PointDto();
            dto.point = [181, 0];
            expect(isValid(dto)).toBe(false);
        });

        it('rejects out-of-range lat', () => {
            const dto = new PointDto();
            dto.point = [0, 91];
            expect(isValid(dto)).toBe(false);
        });

        it('rejects non-number members', () => {
            const dto = new PointDto();
            dto.point = ['127.1', 37.5];
            expect(isValid(dto)).toBe(false);
        });
    });

    describe('IsLine', () => {
        it('accepts an array of valid points', () => {
            const dto = new LineDto();
            dto.line = [
                [127.0, 37.5],
                [127.1, 37.51],
            ];
            expect(isValid(dto)).toBe(true);
        });

        it('accepts empty array (current behavior)', () => {
            const dto = new LineDto();
            dto.line = [];
            expect(isValid(dto)).toBe(true); // every([]) === true
        });

        it('rejects when any point is invalid', () => {
            const dto = new LineDto();
            dto.line = [
                [127.0, 37.5],
                [200, 10], // invalid lon
            ];
            expect(isValid(dto)).toBe(false);
        });

        it('rejects non-array', () => {
            const dto = new LineDto();
            dto.line = 'nope';
            expect(isValid(dto)).toBe(false);
        });
    });

    describe('IsPolygon', () => {
        it('accepts array of lines (rings)', () => {
            const dto = new PolygonDto();
            dto.polygon = [
                [
                    [127.0, 37.5],
                    [127.1, 37.51],
                ],
                [
                    [126.9, 37.49],
                    [127.2, 37.53],
                ],
            ];
            expect(isValid(dto)).toBe(true);
        });

        it('accepts empty polygon (current behavior)', () => {
            const dto = new PolygonDto();
            dto.polygon = [];
            expect(isValid(dto)).toBe(true); // every([]) === true
        });

        it('rejects if any line contains an invalid point', () => {
            const dto = new PolygonDto();
            dto.polygon = [
                [
                    [127.0, 37.5],
                    [181, 0], // invalid lon
                ],
            ];
            expect(isValid(dto)).toBe(false);
        });

        it('rejects non-array at top level', () => {
            const dto = new PolygonDto();
            dto.polygon = 'nope';
            expect(isValid(dto)).toBe(false);
        });
    });
});