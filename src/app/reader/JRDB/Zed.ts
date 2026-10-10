import { Service } from "typedi";
import { Sed } from "./Sed";

/** 前走データ(ZED)。SED と同じフォーマット。 */
@Service()
export class Zed extends Sed {}
