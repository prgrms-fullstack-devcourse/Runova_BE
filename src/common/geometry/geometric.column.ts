import { Column, ColumnOptions, ValueTransformer } from "typeorm";
import { Position } from "./position";
import { Line } from "./line";
import { Shape } from "./shape";
import { LineString, Point, Polygon } from "geojson";

export type GeometricColumnOptions
    = Omit<ColumnOptions, "type" | "spatialFeatureType" | "srid" | "transformer">;

function __MakeGeometricColumn(
    spatialFeatureType: string,
    transformer: ValueTransformer,
) {
    return function (options?: GeometricColumnOptions) {

        const opts: ColumnOptions = {
            type: "geometry",
            spatialFeatureType,
            precision: 6,
            srid: 4326,
            transformer,
        };

        options && Object.assign(opts, options);
        return Column(opts);
    };
}

export const PointColumn = __MakeGeometricColumn(
    "Point",
    {
        from: (point: Point): Position => point.coordinates as Position,
        to: (pos: Position): Point => ({ type: "Point", coordinates: pos }),
    },
);

export const LineStringColumn = __MakeGeometricColumn(
    "LineString",
    {
        from: (lineStr: LineString): Line => lineStr.coordinates as Line,
        to: (line: Line): LineString => ({ type: "LineString", coordinates: line }),
    },
);

export const PolygonColumn = __MakeGeometricColumn(
    "Polygon",
    {
        from: (polygon: Polygon): Shape => polygon.coordinates as Shape,
        to: (shape: Shape): Polygon => ({ type: "Polygon", coordinates: shape }),
    },
);