import { CreateCourseDTO } from "./create.course.dto";

export type InsertCourseDTO
    = Omit<CreateCourseDTO, "runningId" | "path">
    & Required<Pick<CreateCourseDTO, "path">>;