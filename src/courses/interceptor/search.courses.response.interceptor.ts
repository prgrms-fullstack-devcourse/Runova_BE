import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { CourseDTO } from "../dto";
import { SearchCoursesResponse } from "../api";
import { map, Observable } from "rxjs";

@Injectable()
export class SearchCoursesResponseInterceptor
    implements NestInterceptor<
        CourseDTO[] | SearchCoursesResponse,
        SearchCoursesResponse
    > {
    intercept(
        _: ExecutionContext,
        next: CallHandler<CourseDTO[] | SearchCoursesResponse>
    ): Observable<SearchCoursesResponse> {
        return next.handle().pipe(
            map(data =>
                Array.isArray(data)
                    ? __makeSearchCoursesResponse(data)
                    : data
            )
        );
    }
}

function __makeSearchCoursesResponse(results: CourseDTO[]): SearchCoursesResponse {
    const nextCursor = __makeNextCursor(results.at(-1));
    return { results, nextCursor };
}

function __makeNextCursor(
    last?: CourseDTO,
): string | null {
    if (!last) return null;

    return JSON.stringify(
        last.distance === null
            ?  { id: last.id }
            : { id: last.id, distance: last.distance }
    );
}