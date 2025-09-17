import proj, { type Converter } from "proj4";
import { move } from "piscina";

const __WGS84 = "EPSG:4326";
const __UTM_K = "EPSG:5179";
const __PROJ = "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";

proj.defs(__UTM_K, __PROJ);
const __converter: Converter = proj(__WGS84, __UTM_K);

export default function (points: Float32Array): Float32Array {
    if (points.length % 2 !== 0) throw Error("Length of points must be even");
    const points5179 = new Float32Array(points.length);

    for (let i = 0; i < points.length - 1; i += 2) {
        const [x, y] = __converter.forward([points[i], points[i + 1]]);
        points5179[i] = x;
        points5179[i + 1] = y;
    }

    return move(points5179) as Float32Array;
}