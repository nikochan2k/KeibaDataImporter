import * as fs from "node:fs";
import * as path from "node:path";
import * as iconv from "iconv-lite";
import * as $CH from "../../src/app/converters/Choukyou";
import { Codes } from "../../src/app/converters/Codes";
import * as $C from "../../src/app/converters/Common";
import * as $R from "../../src/app/converters/Race";
import * as $S from "../../src/app/converters/Shussouba";
import * as $SJ from "../../src/app/converters/ShussoubaJoutai";
import * as $SY from "../../src/app/converters/ShussoubaYosou";
import * as $U from "../../src/app/converters/Uma";
import { specDir } from "./specs";

export interface TableCode {
  /** 仕様書に書かれたコード(JRDB のデータに現れる文字列) */
  code: string;
  label: string;
}

export interface CodeTable {
  /** 仕様書の項目名 */
  name: string;
  file: string;
  codes: TableCode[];
  /** いずれかの変換器が認識すれば良い(調教コースのように、場所と種類を別の変換器で持つもの) */
  converters: Codes[];
  /** コード表の値を変換器に渡す前に加工する(1 文字ずつ別の項目になっているものなど) */
  convert?: (code: string) => (string | null)[] | null;
  /** 仕様上は存在するが、コードを持たない(null になるのが正しい)値 */
  noCode?: string[];
}

const read = (file: string) =>
  iconv.decode(fs.readFileSync(path.join(specDir, file)), "Windows932");

/** 全角の英数字を半角にする(コード表の一部は全角で書かれている) */
const half = (s: string) =>
  s.replace(/[０-９Ａ-Ｚａ-ｚ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));

/** JRDB データコード表(jrdb_code.txt)から、□見出しごとのコードと内容を取り出す */
export function parseJrdbCode() {
  const sections = new Map<string, TableCode[]>();
  let current: TableCode[] | null = null;
  for (const line of read("jrdb_code.txt").split(/\r?\n/)) {
    const h = line.match(/^□(.+)$/);
    if (h) {
      current = [];
      sections.set(h[1].trim(), current);
      continue;
    }
    if (current === null) {
      continue;
    }
    const m = half(line).match(/^([0-9A-Z]{1,2})[ \t　]+(\S.*)$/);
    if (m) {
      current.push({ code: m[1], label: m[2].trim() });
    }
  }
  return sections;
}

/** 「コード 短縮 内容」の形式の表(特記・馬具・脚元・追い状態・調教コース・系統)から取り出す */
export function parseCodeFile(file: string, pattern: RegExp) {
  const result: TableCode[] = [];
  for (const line of read(file).split(/\r?\n/)) {
    const m = half(line).match(pattern);
    if (m) {
      result.push({ code: m[1], label: line.trim() });
    }
  }
  return result;
}

export function codeTables(): CodeTable[] {
  const jrdb = parseJrdbCode();
  const section = (name: string) => {
    const codes = jrdb.get(name);
    if (!codes) {
      throw new Error(`コード表に□${name}がありません`);
    }
    return codes;
  };
  const tables: CodeTable[] = [];
  const add = (name: string, converter: Codes, extra: Partial<CodeTable> = {}) =>
    tables.push({
      name,
      file: "jrdb_code.txt",
      codes: section(name),
      converters: [converter],
      ...extra,
    });

  add("脚質コード", $S.kyakushitsu);
  add("距離適性コード", $SY.kyoriTekisei);
  add("上昇度", $S.joushoudo);
  add("調教矢印コード", $SY.choukyouYajirushi);
  add("厩舎評価コード", $SY.kyuushaHyouka);
  add("蹄コード", $SY.hidumeCode);
  add("重適性コード", $C.hyouka);
  add("クラスコード", $S.classCode);
  add("場コード", $C.basho);
  add("種別", $R.joukenNenreiSeigen);
  add("条件、条件グループコード", $R.jouken);
  add("重量", $R.betteiBareiHandi);
  // 重賞(4)と特別(5)は Grade ではなく IppanTokubetsu で持つ
  add("グレード", $R.grade, { noCode: ["4", "5"] });
  add("グレード", $R.ippanTokubetsu);
  add("異常区分", $S.chakujunFuka, { noCode: ["0"] });
  add("コース取り", $S.ichi);
  add("馬体コード", $S.bataiCode);
  add("気配コード", $S.kehaiCode);
  add("印コード", $SY.shirushi);
  add("毛色コード", $U.keiro);
  add("馬記号コード", $U.umaKigou, { noCode: ["00"] });
  add("展開記号コード", $SY.tenkaiKigou, { noCode: ["0"] });
  add("天候コード", $R.tenki);
  add("休養理由分類コード", $S.kyuuyouRiyuuCode);
  // 馬場状態は 2 桁(馬場状態 + 馬場速度)。1 桁のもの(開催データの推定値)は別のコード表
  tables.push({
    name: "馬場状態(状態)",
    file: "jrdb_code.txt",
    converters: [$R.baba],
    codes: section("馬場状態").filter((c) => c.code.length === 2),
    convert: (c) => [c[0]],
  });
  tables.push({
    name: "馬場状態(速度)",
    file: "jrdb_code.txt",
    converters: [$R.babaSokudo],
    codes: section("馬場状態").filter((c) => c.code.length === 2),
    convert: (c) => [c[1]],
    noCode: ["10", "20", "30", "40"],
  });

  tables.push({
    name: "特記コード",
    file: "tokki_code.txt",
    converters: [$SJ.tokki],
    codes: parseCodeFile("tokki_code.txt", /^(\d{3})\s+\S/),
  });
  tables.push({
    name: "馬具コード",
    file: "bagu_code.txt",
    converters: [$SJ.bagu],
    codes: parseCodeFile("bagu_code.txt", /^(\d{3})\s+\S/),
  });
  tables.push({
    name: "脚元コード",
    file: "ashimoto_code.txt",
    converters: [$SJ.ashimoto],
    codes: parseCodeFile("ashimoto_code.txt", /^(\d{3})\s+\S/),
  });
  tables.push({
    name: "追い状態コード",
    file: "oi_code.txt",
    converters: [$CH.oiJoutai],
    codes: parseCodeFile("oi_code.txt", /^(\d{2})\s+\S/),
  });
  tables.push({
    name: "調教コースコード",
    file: "cyokyo_course_code.txt",
    converters: [$CH.basho, $CH.type],
    codes: parseCodeFile("cyokyo_course_code.txt", /^([0-9A-Z]{2})\s+\S/),
  });
  tables.push({
    name: "系統コード",
    file: "keito_code.txt",
    converters: [$U.keitou],
    codes: parseCodeFile("keito_code.txt", /^(\d{4})\s+\S/),
  });
  return tables;
}
