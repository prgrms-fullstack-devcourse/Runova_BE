import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { plainToInstanceOrReject } from "../../utils";

@Injectable()
export class ParseQueryPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): any {
        const { type, metatype } = metadata;
        if (type !== "query" || !metatype) return value;

        let data: any;

        plainToInstanceOrReject(metatype, value)
            .then(instance => data = instance)
            .catch(err => {
                throw new BadRequestException(err);
            });

        return data;
    }
}