import {
  ChakudosuuBunrui,
  ChakudosuuKikan,
  ChakudosuuTaishou,
  ShussoubaJouken,
} from "../../converters/Chakudosuu";
import { ChakudosuuWriter } from "../../daos/ChakudosuuDao";
import { findOneBy, upsertLater } from "../../db/helpers";
import { Kyousouba } from "../../entities/Kyousouba";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaJoukenChakudosuu } from "../../entities/ShussoubaJoukenChakudosuu";
import { ShussoubaYosou } from "../../entities/ShussoubaYosou";
import { readInt } from "../Reader";
import { getNengappiOfShussoubaId } from "../ShussoubaTool";
import { JrdbShussoubaData } from "./JrdbShussoubaData";

/**
 * 競走馬拡張データ (KKA)。着度数は 1 着・2 着・3 着・着外の 4 つ (各 3 バイト)。
 * - 馬の生涯成績 (JRA 成績・交流成績・他成績) は、レースの日の時点の Chakudosuu に入れる。
 * - 今回のレースと同じ条件での着度数は、出走馬ごとの ShussoubaJoukenChakudosuu に入れる。
 * - 父馬・母父馬の産駒の連対率と連対平均距離は、ShussoubaYosou に入れる。
 */
export class Kka extends JrdbShussoubaData {
  protected getBufferLength() {
    return 324;
  }

  protected async saveShussoubaRelated(buffer: Buffer, shussouba: Shussouba) {
    await super.saveShussoubaRelated(buffer, shussouba);
    await this.saveSeishou(buffer, shussouba);
    this.saveJouken(buffer, shussouba);
    this.saveSanku(buffer, shussouba);
  }

  /** 馬の生涯成績。競走馬データが先に入っていないと、どの馬か分からないので読み飛ばす */
  private async saveSeishou(buffer: Buffer, shussouba: Shussouba) {
    const kyousouba =
      shussouba.KyousoubaId == null
        ? null
        : await findOneBy(Kyousouba, { Id: shussouba.KyousoubaId });
    if (!kyousouba) {
      this.logger.warn(`競走馬が分からないので、生涯成績を読み飛ばします: 出走馬 ${shussouba.Id}`);
      return;
    }
    const writer = new ChakudosuuWriter();
    const key = {
      Taishou: ChakudosuuTaishou.Uma,
      TaishouId: kyousouba.UmaId,
      Nengappi: getNengappiOfShussoubaId(shussouba.Id),
      Kikan: ChakudosuuKikan.Ruikei,
    };
    writer.add(key, ChakudosuuBunrui.Chuuou, buffer, 10, 3);
    writer.add(key, ChakudosuuBunrui.JrdbKouryuu, buffer, 22, 3);
    writer.add(key, ChakudosuuBunrui.JrdbSonota, buffer, 34, 3);
    writer.save();
  }

  /** 今回の条件での着度数 (46 + (条件の番号 - 1) * 12 から 12 バイトずつ)。回数が全部 0 の条件は行を作らない */
  private saveJouken(buffer: Buffer, shussouba: Shussouba) {
    const count = Object.keys(ShussoubaJouken).length / 2;
    for (let jouken = 1; jouken <= count; jouken++) {
      const offset = 46 + (jouken - 1) * 12;
      const c = [0, 1, 2, 3].map((i) => readInt(buffer, offset + i * 3, 3) ?? 0);
      if (c.every((n) => n === 0)) {
        continue;
      }
      upsertLater(ShussoubaJoukenChakudosuu, {
        ShussoubaId: shussouba.Id,
        Jouken: jouken,
        Chaku1: c[0],
        Chaku2: c[1],
        Chaku3: c[2],
        Chaku4Ika: c[3],
      });
    }
  }

  /** 父馬産駒・母父馬産駒の連対率 (％) と連対平均距離 (m) */
  private saveSanku(buffer: Buffer, shussouba: Shussouba) {
    upsertLater(ShussoubaYosou, {
      Id: shussouba.Id,
      ChichiSankuShibaRentairitsu: readInt(buffer, 286, 3),
      ChichiSankuDirtRentairitsu: readInt(buffer, 289, 3),
      ChichiSankuRentaiHeikinKyori: readInt(buffer, 292, 4),
      HahaChichiSankuShibaRentairitsu: readInt(buffer, 296, 3),
      HahaChichiSankuDirtRentairitsu: readInt(buffer, 299, 3),
      HahaChichiSankuRentaiHeikinKyori: readInt(buffer, 302, 4),
    });
  }
}
