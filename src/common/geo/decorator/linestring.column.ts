import { Column, ColumnOptions, ValueTransformer } from "typeorm";
import { GeometricColumnOptions } from "./geometric.column.options";
import { Coordinates } from "../coordinates";
import { LineString } from "geojson";

const __transformer: ValueTransformer = {
    from(line: LineString): Coordinates[] {
        return line.coordinates
            .map(([lon, lat]) =>
                new Coordinates({ lon, lat })
            );
    },
    to(path: Coordinates[]): LineString {
        const coordinates = path.map(({ lon, lat }) => [lon, lat]);
        return { type: "LineString", coordinates };
    }
};

export function LineStringColumn(options?: GeometricColumnOptions): PropertyDecorator {

    const opts: ColumnOptions = {
        type: "geometry",
        spatialFeatureType: "LineString",
        precision: 6,
        srid: 4326,
        transformer: __transformer,
    };

    options && Object.assign(opts, options);
    return Column(opts);
}