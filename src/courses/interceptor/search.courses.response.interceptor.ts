import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { CourseDTO } from "../dto";
import { SearchCoursesResponse } from "../api";
import { map, Observable } from "rxjs";

@Injectable()
export class SearchCoursesResponseInterceptor
    implements NestInterceptor<
        CourseDTO[],
        SearchCoursesResponse
    > {
    intercept(
        ctx: ExecutionContext,
        next: CallHandler<CourseDTO[]>
    ): Observable<SearchCoursesResponse> {

        const cached: SearchCoursesResponse | undefined
            = ctx.switchToHttp().getRequest().cached;

        return next.handle().pipe(
            map(results =>
                cached
                    ? Object.assign(cached, { results })
                    : __makeSearchCoursesResponse(results)
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