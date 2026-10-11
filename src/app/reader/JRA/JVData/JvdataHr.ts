import { Kakutei } from "../../../converters/Common";
import { JvdataOddsHaitouTool, jvdataOddsHaitouTool } from "./JvdataOddsHaitouTool";
import { jvdataRaceTool } from "./JvdataRaceTool";
import { JvdataRecord } from "./JvdataRecord";

/**
 * 払戻 (HR)。単勝・複勝・枠連・馬連・ワイド・馬単・3連複・3連単の払戻金と人気順。
 * 不成立・特払・返還のフラグと返還馬番は取り込まない。
 */
export class JvdataHr extends JvdataRecord {
  public readonly id = "HR";
  public readonly length = 719;

  public async save(buffer: Buffer) {
    if (!this.isActive(buffer)) {
      return;
    }
    const ensured = await jvdataRaceTool.ensureRace(buffer);
    if (!ensured) {
      return;
    }
    await jvdataOddsHaitouTool.saveRaceHaitou(
      buffer,
      ensured.race.Id,
      Kakutei.Kakutei,
      JvdataOddsHaitouTool.haitouInfos(),
    );
  }
}
