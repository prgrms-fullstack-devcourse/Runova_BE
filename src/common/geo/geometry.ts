
type __Recursive<T> = T | __Recursive<T>[];
export type Coordinates = __Recursive<[number, number]>;

export interface Geometry<
    GType extends string,
    Coords extends Coordinates,
> {
    readonly type: GType;
    readonly coordinates: Coordinates;
}

export type GeometryType<G extends Geometry<any, any>>
    = G extends Geometry<infer GT extends string, infer _>
    ? GT : never;

export type CoordinatesType<G extends Geometry<any, any>>
    = G extends Geometry<infer _, infer Coords extends Coordinates>
    ? Coords : never;




