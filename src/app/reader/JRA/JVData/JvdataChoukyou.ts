import * as $CH from "../../../converters/Choukyou";
import { choukyouDao } from "../../../daos/ChoukyouDao";
import { umaDao } from "../../../daos/UmaDao";
import { Choukyou } from "../../../entities/Choukyou";
import { ChoukyouTime } from "../../../entities/ChoukyouTime";
import { Uma } from "../../../entities/Uma";
import { readInt, readPositiveInt, readRaw } from "../../Reader";
import { tool } from "../../Tool";
import { jraTool } from "../JraTool";
import { JvdataRecord } from "./JvdataRecord";

/**
 * 坂路調教 (HC)・ウッドチップ調教 (WC)。調教 1 本を Choukyou の 1 行にする。
 * KOL・JRDB から入った同じ調教があれば、その行に足す (ChoukyouDao.saveChoukyou)。
 * 時計は KOL と同じく、ハロン数 F ごとの「残り F ハロンの合計タイム」で持つ。1 F は最後の 1 ハロンのラップ。
 * 途中のラップは合計タイムの差なので取り込まない。
 */
abstract class JvdataChoukyou extends JvdataRecord {
  protected abstract readonly type: $CH.ChoukyouType;

  /** 合計タイムの位置 (ハロン数 → 0 始まりの位置、4 バイト) */
  protected abstract readonly goukeiOffsets: [number, number][];

  /** 最後の 1 ハロンのラップの位置 (3 バイト) */
  protected abstract readonly lastLapOffset: number;

  protected setChoukyou(_buffer: Buffer, _choukyou: Choukyou) {}

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const days = tool.getDaysFrom1970(buffer, 12);
    const touroku = jraTool.readTouroku(buffer, 24);
    const basho = $CH.basho.toCodeFromJvData(buffer, 11, 1);
    if (days === null || !touroku || basho == null) {
      return;
    }
    const toBe = {} as Uma;
    toBe.KettouTourokuBangou = touroku.bangou;
    toBe.Seinen = touroku.seinen;
    const uma = await umaDao.saveUma(toBe);

    const choukyou = {} as Choukyou;
    choukyou.UmaId = uma.Id;
    choukyou.Nengappi = readInt(buffer, 12, 8);
    const jikoku = readRaw(buffer, 20, 4);
    if (/^\d{4}$/.test(jikoku)) {
      choukyou.Jikoku = `${jikoku.substring(0, 2)}:${jikoku.substring(2)}`;
    }
    choukyou.Basho = basho;
    choukyou.Type = this.type;
    this.setChoukyou(buffer, choukyou);

    const times: ChoukyouTime[] = [];
    for (const [f, offset] of this.goukeiOffsets) {
      this.pushTime(times, f, buffer, offset, 4);
    }
    this.pushTime(times, 1, buffer, this.lastLapOffset, 3);
    choukyouDao.saveChoukyou(choukyou, days, times);
  }

  /** 0.1 秒単位の時計。測定不良 (0) と上限 (9999・999 は 999.9 秒・99.9 秒以上) は入れない */
  private pushTime(
    times: ChoukyouTime[],
    f: number,
    buffer: Buffer,
    offset: number,
    length: number,
  ) {
    const value = readPositiveInt(buffer, offset, length);
    if (value == null || value === 10 ** length - 1) {
      return;
    }
    const time = {} as ChoukyouTime;
    time.F = f;
    time.Time = value / 10;
    times.push(time);
  }
}

/** 坂路調教 (HC)。4 ハロン (800 m) から。 */
export class JvdataHc extends JvdataChoukyou {
  public readonly id = "HC";
  public readonly length = 60;
  protected readonly type = $CH.ChoukyouType.Hanro;
  protected readonly goukeiOffsets: [number, number][] = [
    [4, 34],
    [3, 41],
    [2, 48],
  ];
  protected readonly lastLapOffset = 55;
}

/** ウッドチップ調教 (WC)。10 ハロン (2000 m) から。コースと馬場周りもある。 */
export class JvdataWc extends JvdataChoukyou {
  public readonly id = "WC";
  public readonly length = 105;
  protected readonly type = $CH.ChoukyouType.WoodChip;
  protected readonly goukeiOffsets: [number, number][] = [10, 9, 8, 7, 6, 5, 4, 3, 2].map(
    (f, i) => [f, 37 + i * 7],
  );
  protected readonly lastLapOffset = 100;

  protected setChoukyou(buffer: Buffer, choukyou: Choukyou) {
    choukyou.Course = $CH.course.toCodeFromJvData(buffer, 34, 1);
    choukyou.MigiHidari = readInt(buffer, 35, 1);
  }
}
