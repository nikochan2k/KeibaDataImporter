import { Injectable } from "@nestjs/common";
import { Sed } from "./Sed";

/** 前走データ(ZED)。SED と同じフォーマット。 */
@Injectable()
export class Zed extends Sed {}
