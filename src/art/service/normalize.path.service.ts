import { Inject, Injectable } from "@nestjs/common";
import { ArtStyleService } from "./art.style.service";

@Injectable()
export class NormalizePathService {

    constructor(
       @Inject(ArtStyleService)
       private readonly style: ArtStyleService,
    ) {}


}