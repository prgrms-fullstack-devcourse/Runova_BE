type __Recursive<T> = T | __Recursive<T>[];
export type Coordinates = __Recursive<[number, number]>;

export interface GeoJson {
    type: string;
    coordinates: Coordinates;
}
