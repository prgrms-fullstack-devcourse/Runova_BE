import { Column, ColumnOptions } from "typeorm";
import { fromLineString, toLineString } from "./transformer";
import { GeometricColumnOptions } from "./geometric.column.options";

export function LineStringColumn(options?: GeometricColumnOptions): PropertyDecorator {

    const opts: ColumnOptions = {
        type: "geometry",
        spatialFeatureType: "LineString",
        precision: 6,
        srid: 4326,
        transformer: {
            from: fromLineString,
            to: toLineString
        },
    };

    options && Object.assign(opts, options);
    return Column(opts);
}