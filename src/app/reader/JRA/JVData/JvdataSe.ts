import { hasSeiseki, jvdataRaceTool } from "./JvdataRaceTool";
import { JvdataRecord } from "./JvdataRecord";
import { jvdataShussoubaTool } from "./JvdataShussoubaTool";

/**
 * 馬毎レース情報 (SE)。
 * 馬番が決まる前の出走馬名表と、馬番が不明の海外レースの出走馬は取り込まない。
 * 変更前の負担重量・騎手、服色標示、相手馬情報、マイニング予想、脚質判定、後 4 ハロンは取り込まない。
 */
export class JvdataSe extends JvdataRecord {
  public readonly id = "SE";
  public readonly length = 555;

  public async save(buffer: Buffer) {
    if (!this.isActive(buffer) || !jvdataShussoubaTool.getUmaban(buffer)) {
      return;
    }
    const ensured = await jvdataRaceTool.ensureRace(buffer);
    if (!ensured) {
      return;
    }
    const saved = await jvdataShussoubaTool.saveJvdataShussoubaOf(
      buffer,
      ensured.race,
      ensured.kaisai.Nen,
    );
    if (saved && hasSeiseki(this.getKubun(buffer))) {
      await jvdataShussoubaTool.saveJvdataSeisekiOf(buffer, ensured.race, saved);
    }
  }
}
