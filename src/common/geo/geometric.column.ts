import { Column, ColumnOptions } from "typeorm";
import { Coordinates, GeoJson } from "./geojson";

export type GeometricColumnOptions
    = Omit<ColumnOptions, "type" | "spatialFeatureType" | "srid" | "transformer">;


function __MakeGeometricColumn(type: string) {
    return function (options?: GeometricColumnOptions) {

        const opts: ColumnOptions = {
            type: "geometry",
            spatialFeatureType: type,
            precision: 6,
            srid: 4326,
            transformer: {
                from(geom: GeoJson): Coordinates {
                    return geom.coordinates;
                },
                to(coordinates: Coordinates): GeoJson {
                    return { type, coordinates };
                }
            },
        };

        options && Object.assign(opts, options);
        return Column(opts);
    };
}

export const PointColumn
    = __MakeGeometricColumn("Point");

export const LineStringColumn
    = __MakeGeometricColumn("LineString");

export const PolygonColumn
    = __MakeGeometricColumn("Polygon");


