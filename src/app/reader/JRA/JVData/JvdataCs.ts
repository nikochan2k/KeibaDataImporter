import * as $C from "../../../converters/Common";
import { upsert } from "../../../db/helpers";
import { CourseSetsumei } from "../../../entities/CourseSetsumei";
import { readPositiveInt, readRaw, readStr } from "../../Reader";
import { getJraTrack } from "../JraTrack";
import { JvdataRecord } from "./JvdataRecord";

/** コース情報 (CS)。競馬場・距離・トラック・コース改修年月日ごとのコースの説明。 */
export class JvdataCs extends JvdataRecord {
  public readonly id = "CS";
  public readonly length = 6829;

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const basho = $C.basho.toCodeFromJvData(buffer, 11, 2);
    const kyori = readPositiveInt(buffer, 13, 4);
    const trackCode = readPositiveInt(buffer, 17, 2);
    const kaishuuNengappi = readPositiveInt(buffer, 19, 8);
    if (basho == null || kyori == null || trackCode == null || kaishuuNengappi == null) {
      return;
    }
    const track = getJraTrack(readRaw(buffer, 17, 2));
    upsert(CourseSetsumei, {
      Basho: basho,
      Kyori: kyori,
      TrackCode: trackCode,
      KaishuuNengappi: kaishuuNengappi,
      DirtShiba: track?.dirtShiba,
      MigiHidari: track?.migiHidari,
      UchiSoto: track?.uchiSoto,
      Setsumei: readStr(buffer, 27, 6800),
    });
  }
}
