import proj from "proj4";
import process from "node:process";
import { Coordinates, Location } from "../common/geo";

const __WGS84 = "EPSG:4326";
const __CRS_NAME: string = process.env.GIS_EPSG_NAME ?? "EPSG:5179";

proj.defs(
    __CRS_NAME,
    process.env.GIS_EPSG_PROJECTION
    ?? "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);

const __converter = proj(__WGS84, __CRS_NAME);

export const CRS_CODE = Number(__CRS_NAME.split(':')[1]);

export function globeToProjected(location: Location): Coordinates {
    const { lon: x, lat: y } = location;
    return new Coordinates(__converter.forward({ x, y }));
}