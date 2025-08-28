import proj from "proj4";
import process from "node:process";

export const CRS_NAME: string = process.env.GIS_EPSG_NAME ?? "EPSG:5179";

proj.defs(
    CRS_NAME,
    process.env.GIS_EPSG_PROJECTION
    ?? "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 " +
    "+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);