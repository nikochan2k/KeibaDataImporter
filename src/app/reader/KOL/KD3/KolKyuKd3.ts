import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import * as $C from "../../../converters/Common";
import * as $K from "../../../converters/Kyuusha";
import { KyuushaDao } from "../../../daos/KyuushaDao";
import { Kyuusha } from "../../../entities/Kyuusha";
import { KishuRireki } from "../../../entities/KishuRireki";
import { DataToImport } from "../../DataToImport";
import {
  readInt,
  readStr,
} from "../../Reader";

@Service()
export class KolKyuKd3 extends DataToImport {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  private kyuushaDao: KyuushaDao;

  protected getBufferLength() {
    return 1729;
  }

  public async save(buffer: Buffer) {
    let kyuusha = new Kyuusha();
    kyuusha.KolKyuushaCode = readInt(buffer, 0, 5);
    kyuusha.Seinengappi = readInt(buffer, 93, 8);
    kyuusha.HatsuMenkyoNen = readInt(buffer, 101, 4);
    kyuusha.TouzaiBetsu = $C.touzaiBetsu.toCodeFromKol(buffer, 105, 1);
    kyuusha.ShozokuBasho = $C.basho.toCodeFromKol(buffer, 106, 2);
    kyuusha.RitsuHokuNanBetsu = $K.ritsuHokuNanBetsu.toCodeFromKol(buffer, 108, 1);
    kyuusha.TourokuMasshouFlag = $C.masshouFlag.toCodeFromKol(buffer, 109, 1);
    const kishuMei = readStr(buffer, 5, 32);
    const tanshukuKishuMei = readStr(buffer, 37, 8);
    const furigana = readStr(buffer, 45, 48);
    kyuusha = await this.kyuushaDao.saveKyuusha(kyuusha, kishuMei, tanshukuKishuMei, furigana);
  }

}