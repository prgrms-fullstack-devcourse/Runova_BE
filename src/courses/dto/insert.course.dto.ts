import { CreateCourseDTO } from "./create.course.dto";

export type InsertCourseDTO
    = Omit<CreateCourseDTO, "path"> & Required<Pick<CreateCourseDTO, "path">>;