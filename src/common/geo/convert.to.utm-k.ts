import proj from "proj4";
import type { Converter } from "proj4";

const __WGS84 = "EPSG:4326";
const __UTM_K = "EPSG:5179";
const __PROJ = "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";

proj.defs(__UTM_K, __PROJ);
const __converter: Converter = proj(__WGS84, __UTM_K);

export function convertToUTMK(p: [number, number]): [number, number] {
    return __converter.forward(p);
}
