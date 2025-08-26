import { Location } from "./location";
import { LineString, Point } from "geojson";
import { Coordinates } from "./coordinates";

export function convertLocationsToLineString(path: Location[]): LineString {
    const coordinates = path.map(({ lon, lat }) => [lon, lat]);
    return { type: "LineString", coordinates };
}

export function convertLineStringToLocations(line: LineString): Location[] {
    return line.coordinates
        .map(([lon, lat]) =>
            new Location({ lon, lat })
        );
}

export function convertCoordinatesToPoint(coordinates: Coordinates): Point {
    const { x, y } = coordinates;
    return { type: "Point", coordinates: [x, y] };
}

export function convertPointToCoordinates(point: Point): Coordinates {
    const [x, y] = point.coordinates;
    return new Coordinates({ x, y });
}

