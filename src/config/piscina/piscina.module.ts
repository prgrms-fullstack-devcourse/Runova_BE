import { Global, Module } from "@nestjs/common";
import { PiscinaFactory } from "./piscina.factory";

@Global()
@Module({
    providers: [PiscinaFactory],
    exports: [PiscinaFactory],
})
export class PiscinaModule {}