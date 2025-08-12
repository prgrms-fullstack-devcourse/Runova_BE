import { ValueTransformer } from "typeorm";
import { convert, nativeJs, LocalDateTime } from "@js-joda/core";

const transformer:  ValueTransformer = {
    from(date: Date): LocalDateTime {
        return nativeJs(date).toLocalDateTime();
    },
    to(datetime: LocalDateTime): Date {
        return convert(datetime).toDate();
    }
};

export default transformer;

