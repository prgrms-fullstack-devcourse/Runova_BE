import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { SearchRunningRecordsResponse } from "../api";
import { RunningRecordPreviewDTO } from "../dto";
import { map, Observable } from "rxjs";

@Injectable()
export class SearchRunningRecordsInterceptor
    implements NestInterceptor<
        SearchRunningRecordsResponse | RunningRecordPreviewDTO[],
        SearchRunningRecordsResponse
    > {
    intercept(
        _: ExecutionContext,
        next: CallHandler<SearchRunningRecordsResponse | RunningRecordPreviewDTO[]>
    ): Observable<SearchRunningRecordsResponse> {
        return next.handle().pipe(
            map(data => {

                if (Array.isArray(data)) {
                    const lastId = data.at(-1)?.id;

                    const nextCursor = lastId !== undefined
                        ? { id: lastId }
                        : null;

                    return { results: data, nextCursor };
                }

                return data;
            })
        )
    }

}