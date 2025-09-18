
export interface CreateCourseNodesDTO {
    courseId: number;
    locations: [number, number][];
    progresses: Float32Array;
    bearings: Float32Array;
}