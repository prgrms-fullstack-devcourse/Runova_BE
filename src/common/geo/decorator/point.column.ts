import { GeometricColumnOptions } from "./geometric.column.options";
import { Column, ColumnOptions, ValueTransformer } from "typeorm";
import { Point } from "geojson";
import { Coordinates } from "../coordinates";

const __transformer: ValueTransformer = {
    from(point: Point): Coordinates {
        const [lon, lat] = point.coordinates;
        return new Coordinates({ lon, lat });
    },
    to(location: Coordinates): Point {
        const { lon, lat } = location;
        return { type: "Point", coordinates: [lon, lat] };
    }
};

export function PointColumn(options?: GeometricColumnOptions) {

    const  opts: ColumnOptions = {
        type: "geometry",
        spatialFeatureType: "Point",
        precision: 6,
        srid: 4326,
        transformer: __transformer,
    };

    options && Object.assign(opts, options);
    return Column(opts);
}