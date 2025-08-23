import { Coordinates } from "./coordinates";
import { LineString, Point } from "geojson";

export function toLineString(path: Coordinates[]): LineString {
    const coordinates = path.map(({ lon, lat }) => [lon, lat]);
    return { type: "LineString", coordinates };
}

export function fromLineString(line: LineString): Coordinates[] {
    return line.coordinates
        .map(([lon, lat]) =>
            new Coordinates({ lon, lat })
        );
}

export function toPoint({ lon, lat }: Coordinates): Point {
    return { type: "Point", coordinates: [lon, lat] };
}

export function fromPoint(point: Point): Coordinates {
    const [lon, lat] = point.coordinates;
    return new Coordinates({ lon, lat });
}