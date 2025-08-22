import { Inject, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { Coordinates } from "../../common/geo";
import { ConfigService } from "@nestjs/config";
import { plainToInstanceOrReject } from "../../utils";
import { DataSource } from "typeorm";
import { InspectPathResult } from "../dto";

@Injectable()
export class InspectPathService {
    private readonly tol: number;

    constructor(
       @InjectDataSource()
       private readonly ds: DataSource,
       @Inject(ConfigService)
       config: ConfigService,
    ) {
        this.tol = config.get<number>(
            "GIS_SIMPLIFY_TOLERANCE"
        ) ?? 0.000008;
    }

    async inspect(path: Coordinates[]): Promise<InspectPathResult> {
        const wkt = __toLineString(path);

        const raw = await this.ds.sql`
            WITH simplified AS (
                SELECT ST_Simplify(
                           ST_SetSRID(
                                ST_GeomFromText(${wkt}),
                                4326
                           ),
                           ${this.tol} 
                ) AS geom
            )
            SELECT 
                l.length AS length,
                jsonb_agg(
                    jsonb_build_object(
                        'location', node.location,
                        'progress', node.progress,
                        'bearing', node.bearing
                    )
                ) AS nodes
            FROM simplified AS s 
            CROSS JOIN LATERAL ( 
                SELECT (ST_Length(ST_Transform(s.geom, 5179)) / 1000) AS length
            ) AS l
            CROSS JOIN LATERAL (
                SELECT
                    jsonb_build_object(
                            'lon', ST_X(p),
                            'lat', ST_Y(p)
                    ) AS location,
                    ST_LineLocatePoint(s.geom, p)  AS progress,
                    (mod(
                            (degrees(theta) - degrees(LAG(theta, 1, 0) OVER (ORDER BY idx)) + 540)::numeric,
                            360
                    )::float8 - 180) AS bearing
                FROM (
                         SELECT
                             ds.path[1] AS idx,
                             ST_StartPoint(ds.geom) AS p,
                             ST_Azimuth(ST_StartPoint(ds.geom), ST_EndPoint(ds.geom)) AS theta
                         FROM generate_series(1, )
                ) AS seg   
            ) AS node
            GROUP BY l.length
        `;

        return plainToInstanceOrReject(InspectPathResult, raw);
    }

}

function __toLineString(path: Coordinates[]): string {

    const inner = path.map(({ lon, lat }) =>
        `${lon} ${lat}`
    ).join(",");

    return `LINESTRING (${inner})`;
}