import { GeometricColumnOptions } from "./geometric.column.options";
import { Column, ColumnOptions } from "typeorm";

export function PolygonColumn(options?: GeometricColumnOptions) {

    const opts: ColumnOptions = {
        type: "geometry",
        spatialFeatureType: "Polygon",
        precision: 6,
        srid: 4326,
    };

    options && Object.assign(opts, options);
    return Column(opts);
}