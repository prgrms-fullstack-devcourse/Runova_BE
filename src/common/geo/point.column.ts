import { GeometricColumnOptions } from "./geometric.column.options";
import { Column, ColumnOptions } from "typeorm";
import { fromPoint, toPoint } from "./transformer";

export function PointColumn(options?: GeometricColumnOptions) {

    const  opts: ColumnOptions = {
        type: "geometry",
        spatialFeatureType: "Point",
        precision: 6,
        srid: 4326,
        transformer: { from: fromPoint, to: toPoint },
    };

    options && Object.assign(opts, options);
    return Column(opts);
}