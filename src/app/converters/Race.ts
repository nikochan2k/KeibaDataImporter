import { Codes } from "./Codes";

export const kyuujitsu = new Codes(
  [
    { code: 1, kol: "1", naiyou: "祝日" },
    { code: 2, kol: "2", naiyou: "振替休日" },
    { code: 3, kol: "3", naiyou: "国民の休日" }
  ]
);

export const youbi = new Codes(
  [
    { code: 1, kol: "1", naiyou: "土" },
    { code: 2, kol: "2", naiyou: "日" },
    { code: 3, kol: "3", naiyou: "月" },
    { code: 4, kol: "4", naiyou: "火" },
    { code: 5, kol: "5", naiyou: "水" },
    { code: 6, kol: "6", naiyou: "木" },
    { code: 7, kol: "7", naiyou: "金" }
  ]
);

export const chuuouChihouGaikoku = new Codes(
  [
    { code: 0, kol: "0", naiyou: "中央" },
    { code: 1, kol: "1", naiyou: "南関東" },
    { code: 2, kol: "2", naiyou: "公営" },
    { code: 3, kol: "3", naiyou: "道営" },
    { code: 4, kol: "4", naiyou: "外国" }
  ]
);

export const ippanTokubetsu = new Codes(
  [
    { code: 3, kol: "3", jrdb: /1|2|3|4/, naiyou: "重賞" },
    { code: 2, kol: "2", naiyou: "準重賞" },
    { code: 0, kol: "0", jrdb: /./, naiyou: "一般" },
    { code: 1, kol: "1", jrdb: "5", naiyou: "特別" },
  ]
);

export const heichiShougai = new Codes(
  [
    { code: 0, kol: "0", naiyou: "平地" },
    { code: 1, kol: "1", naiyou: "障害" }
  ]
);

export const grade = new Codes(
  [
    { code: 1, kol: "0", jrdb: "1", naiyou: "G1" },
    { code: 2, kol: "1", jrdb: "2", naiyou: "G2" },
    { code: 3, kol: "2", jrdb: "3", naiyou: "G3" },
    { code: 4, kol: "3", naiyou: "JG1" },
    { code: 5, kol: "4", naiyou: "JG2" },
    { code: 6, kol: "5", naiyou: "JG3" },
    { code: 11, naiyou: "G1(Jpn)" },
    { code: 12, naiyou: "G2(Jpn)" },
    { code: 13, naiyou: "G3(Jpn)" },
    { code: 14, naiyou: "JG1(Jpn)" },
    { code: 15, naiyou: "JG2(Jpn)" },
    { code: 16, naiyou: "JG3(Jpn)" },
  ]
);

export const jpnFlag = new Codes(
  [
    { code: 10, kol: "1", naiyou: "Jpn" },
    { code: 0, kol: ".", naiyou: "" },
  ]
);

export const betteiBareiHandi = new Codes(
  [
    { code: 0, kol: "00", jrdb: "2", naiyou: "別定" },
    { code: 1, kol: "01", jrdb: "3", naiyou: "馬齢" },
    { code: 2, kol: "02", jrdb: "1", naiyou: "ハンデ" },
    { code: 3, kol: "03", jrdb: "4", naiyou: "定量" },
    { code: 4, kol: "90", naiyou: "規定" }
  ]
);

export const betteiBareiHandi2 = new Codes(
  [
    { code: 0, kol: /別定/, naiyou: "別定" },
    { code: 1, kol: /馬齢/, naiyou: "馬齢" },
    { code: 2, kol: /ハンデ/, naiyou: "ハンデ" },
    { code: 3, kol: /定量/, naiyou: "定量" },
    { code: 4, kol: /規定/, naiyou: "規定" }
  ]
);

export const joukenKei = new Codes(
  [
    {
      code: 2 ** 0,
      kol: /0|1|2|3|4|8|9|B|K/,
      naiyou: "サラ系"
    },
    { code: 2 ** 1, kol: /5|6|7|A|C/, naiyou: "アラブ系" }
  ]
);

export const joukenFuka1 = new Codes(
  [
    { code: 2 ** 0, naiyou: "サラ系" },
    { code: 2 ** 1, naiyou: "アラブ系" },
    { code: 2 ** 2, kol: /24|27|28|33|38|40/, jrdb: /.[134]./, naiyou: "牡" },
    { code: 2 ** 3, kol: /03|10|33|35|38|40/, jrdb: /.[24]./, naiyou: "牝" },
    { code: 2 ** 4, kol: /24|27|28/, jrdb: /.3./, naiyou: "せん" },
    { code: 2 ** 5, kol: /04|08|10|13|27|38/, jrdb: /1../, naiyou: "○混" },
    { code: 2 ** 6, kol: "05", jrdb: /2../, naiyou: "○父" },
    { code: 2 ** 7, kol: /07|11|19|20/, jrdb: /3../, naiyou: "○市" },
    { code: 2 ** 8, kol: /09|14|15|16|19|20/, jrdb: /3../, naiyou: "○抽" },
    { code: 2 ** 9, kol: /06|07|17|18/, naiyou: "□抽" },
    { code: 2 ** 10, kol: /29|35|40/, jrdb: /5../, naiyou: "○国際" },
    { code: 2 ** 11, kol: "12", naiyou: "○招" },
    { code: 2 ** 12, kol: /13|21|30/, jrdb: /..1/, naiyou: "○指" },
    { code: 2 ** 13, kol: "31", jrdb: /..3/, naiyou: "○特指" },
    { code: 2 ** 14, kol: "32", jrdb: /..2/, naiyou: "□指" },
    { code: 2 ** 15, kol: /00|08|14/, naiyou: "勝入" },
    { code: 2 ** 16, kol: "02", naiyou: "内国" },
    { code: 2 ** 17, kol: "25", naiyou: "交流" },
    { code: 2 ** 18, jrdb: /..4/, naiyou: "若手" },
    { code: 2 ** 19, kol: "01", jrdb: /4../, naiyou: "九州産馬" },
    { code: 2 ** 20, kol: "26", naiyou: "千葉産" },
    { code: 2 ** 21, kol: /15|17|19/, naiyou: "関西配布馬" },
    { code: 2 ** 22, kol: /16|18|20/, naiyou: "関東配布馬" },
    { code: 2 ** 23, kol: "34", naiyou: "JRA認定" },
    { code: 2 ** 24, kol: "39", naiyou: "JRA指定" },
    { code: 2 ** 25, kol: "22", naiyou: "芦毛" },
    { code: 2 ** 26, kol: "23", naiyou: "栗毛" },
    { code: 2 ** 27, kol: "36", naiyou: "芦・白" },
    { code: 2 ** 28, kol: "37", naiyou: "黒鹿毛" },
  ]
);

export const joukenFuka2 = new Codes(
  [
    { code: 2 ** 12, kol: "1", naiyou: "○指" },
    { code: 2 ** 13, kol: "2", naiyou: "○特指" },
    { code: 2 ** 14, kol: "3", naiyou: "□指" },
    { code: 2 ** 12, kol: "4", naiyou: "○指" }
  ]
);

export const kouryuuFlag = new Codes(
  [
    { code: 2 ** 17, kol: "1", jrdb: /..[1-4]/, naiyou: "交流" }
  ]
);

export const seed = new Codes(
  [
    { code: 2 ** 29, kol: "1", naiyou: "シード" }
  ]
);

export const joukenNenreiSeigen = new Codes(
  [
    { code: 0, kol: "0", jrdb: "11", naiyou: "2歳" },
    { code: 1, kol: "1", jrdb: "12", naiyou: "3歳" },
    { code: 2, kol: "2", naiyou: "4歳" },
    { code: 3, kol: "3", naiyou: "3,4,5歳" },
    { code: 4, kol: "4", naiyou: "4,5,6歳" },
    { code: 5, kol: "5", jrdb: "13", naiyou: "3歳以上" },
    { code: 6, kol: "6", jrdb: "14", naiyou: "4歳以上" },
    { code: 7, kol: "7", naiyou: "3,4歳" },
    { code: 8, kol: "8", naiyou: "4,5歳" }
  ]
);

export const joukenNenreiSeigen2 = new Codes(
  [
    { code: 0, kol: /1|5/, naiyou: "2歳" },
    { code: 1, kol: /2|6/, naiyou: "3歳" },
    { code: 2, kol: /B|C/, naiyou: "4歳" },
    { code: 5, kol: /3|7|8/, naiyou: "3歳以上" },
    { code: 6, kol: /4|9|A/, naiyou: "4歳以上" }
  ]
);

export const jouken = new Codes(
  [
    { code: 0, kol: "00000", naiyou: "未受" },
    { code: 1, kol: "00001", jrdb: "A1", naiyou: "新馬" },
    { code: 2, kol: "00002", jrdb: "A2", naiyou: "未出走" },
    { code: 3, kol: "00003", jrdb: "A3", naiyou: "未勝利" },
    { code: 4, kol: "00004", jrdb: "OP", naiyou: "オープン" },
    { code: 5, kol: "00005", naiyou: "オープン・牝馬" },
    { code: 6, kol: "00006", naiyou: "指定馬" },
    { code: 7, kol: "00007", naiyou: "勝入オープン" },
    { code: 8, kol: "00008", naiyou: "牝馬" },
    { code: 9, kol: "00009", naiyou: "オーブン・牝馬・アラブ混合" },
    { code: 10, kol: "00010", naiyou: "A" },
    { code: 11, kol: "00011", naiyou: "A1" },
    { code: 12, kol: "00012", naiyou: "A2" },
    { code: 13, kol: "00013", naiyou: "A3" },
    { code: 14, kol: "00014", naiyou: "A4" },
    { code: 20, kol: "00020", naiyou: "B" },
    { code: 21, kol: "00021", naiyou: "B1" },
    { code: 22, kol: "00022", naiyou: "B2" },
    { code: 23, kol: "00023", naiyou: "B3" },
    { code: 24, kol: "00024", naiyou: "B4" },
    { code: 30, kol: "00030", naiyou: "C" },
    { code: 31, kol: "00031", naiyou: "C1" },
    { code: 32, kol: "00032", naiyou: "C2" },
    { code: 33, kol: "00033", naiyou: "C3" },
    { code: 34, kol: "00034", naiyou: "C4" },
    { code: 40, kol: "00040", naiyou: "D" },
    { code: 41, kol: "00041", naiyou: "D1" },
    { code: 42, kol: "00042", naiyou: "D2" },
    { code: 43, kol: "00043", naiyou: "D3" },
    { code: 44, kol: "00044", naiyou: "D4" },
    { code: 93, kol: "00093", naiyou: "調教試験" },
    { code: 94, kol: "00094", naiyou: "能力試験" },
    { code: 4000, kol: "04000", jrdb: "04", naiyou: "400万" },
    { code: 5000, kol: "05000", jrdb: "05", naiyou: "500万" },
    { code: 8000, kol: "08000", jrdb: "08", naiyou: "800万" },
    { code: 9000, kol: "09000", jrdb: "09", naiyou: "900万" },
    { code: 10000, kol: "10000", jrdb: "10", naiyou: "1000万" },
    { code: 15000, kol: "15000", jrdb: "15", naiyou: "1500万" },
    { code: 16000, kol: "16000", jrdb: "16", naiyou: "1600万" },
    { code: -13, kol: "-0013", naiyou: "未出" },
    { code: -14, kol: "-0014", naiyou: "未勝" },
    { code: -15, kol: "-0015", naiyou: "新馬" },
    { code: -16, kol: "-0016", naiyou: "オープン" },
    { code: -42, kol: "-0042", naiyou: "３才" },
    { code: -43, kol: "-0043", naiyou: "４才" },
    { code: -44, kol: "-0044", naiyou: "能検" },
    { code: -50, kol: "-0050", naiyou: "未受" },
    { code: -51, kol: "-0051", naiyou: "GⅠ" },
    { code: -52, kol: "-0052", naiyou: "GⅡ" },
    { code: -53, kol: "-0053", naiyou: "GⅢ" },
    { code: -54, kol: "-0054", naiyou: "GⅣ" },
    { code: -55, kol: "-0055", naiyou: "GⅤ" },
    { code: -56, kol: "-0056", naiyou: "5才" },
    { code: -57, kol: "-0057", naiyou: "C5" },
    { code: -58, kol: "-0058", naiyou: "C6" },
    { code: -59, kol: "-0059", naiyou: "2才" },
    { code: -60, kol: "-0060", naiyou: "認初出" },
    { code: -61, kol: "-0061", naiyou: "認未勝" },
    { code: -62, kol: "-0062", naiyou: "認定" },
    { code: -63, kol: "-0063", naiyou: "サラ" },
    { code: -64, kol: "-0064", naiyou: "E" },
    { code: -65, kol: "-0065", naiyou: "F" },
    {
      kol: (str: string) => {
        const num = parseInt(str);
        if (100 <= num) return num;
        return null;
      },
      naiyou: (code: number) => {
        if (100 <= code) return (code / 10) + "万";
        return null;
      }
    }
  ]
);

export const ijouIkaMiman = new Codes(
  [
    { code: 0, kol: "0", naiyou: "以上" },
    { code: 1, kol: "1", naiyou: "以下" },
    { code: 2, kol: "2", naiyou: "〜" },
    { code: 3, kol: "3", naiyou: "未満" },
    { code: 4, kol: "4", naiyou: "・" },
    { code: 5, kol: "5", naiyou: "以上" },
    { code: 6, kol: "6", naiyou: "以下" },
    { code: 7, kol: "7", naiyou: "未満" }
  ]
);

export const dirtShiba = new Codes(
  [
    { code: 0, kol: "0", naiyou: "ダート" },
    { code: 1, kol: "1", naiyou: "芝" }
  ]
);

export const migiHidari = new Codes(
  [
    { code: 0, kol: "0", naiyou: "右" },
    { code: 1, kol: "1", naiyou: "左" },
    { code: 2, kol: "2", naiyou: "直線" }
  ]
);

export const uchiSoto = new Codes(
  [
    { code: 0, kol: "0", naiyou: "内" },
    { code: 1, kol: "1", naiyou: "外" },
    { code: 2, kol: "2", naiyou: "外→内" },
    { code: 3, kol: "3", naiyou: "タヌキ" },
    { code: 4, kol: "4", naiyou: "大障害" },
    { code: 5, kol: "5", naiyou: "内2周" },
    { code: 6, kol: "6", naiyou: "内→外" }
  ]
);

export const course = new Codes(
  [
    { code: 0, kol: "0", naiyou: "A" },
    { code: 1, kol: "1", naiyou: "B" },
    { code: 2, kol: "2", naiyou: "C" },
    { code: 3, kol: "3", naiyou: "D" },
    { code: 4, kol: "4", naiyou: "A1" },
    { code: 5, kol: "5", naiyou: "B1" }
  ]
);

export const recordFlag = new Codes(
  [
    { code: 0, kol: "0", naiyou: "基準" },
    { code: 1, kol: "1", naiyou: "レコード" },
    { code: 2, kol: "2", naiyou: "参考" }
  ]
);

export const maeuriFlag = new Codes(
  [
    { code: 1, kol: "1", naiyou: "前売り" }
  ]
);

export const pace = new Codes(
  [
    { code: 0, kol: "0", naiyou: "H" },
    { code: 1, kol: "1", naiyou: "M" },
    { code: 2, kol: "2", naiyou: "S" }
  ]
);

export const tenki = new Codes(
  [
    { code: 0, kol: "0", jrdb: "1", naiyou: "晴" },
    { code: 1, kol: "1", jrdb: "2", naiyou: "曇" },
    { code: 2, kol: "2", jrdb: "4", naiyou: "雨" },
    { code: 3, kol: "3", jrdb: "3", naiyou: "小雨" },
    { code: 4, kol: "4", jrdb: "6", naiyou: "雪" },
    { code: 5, kol: "5", naiyou: "風" },
    { code: 6, kol: "6", jrdb: "5", naiyou: "小雪" }
  ]
);

export const baba = new Codes(
  [
    { code: 0, kol: "0", naiyou: "良" },
    { code: 1, kol: "1", naiyou: "稍重" },
    { code: 2, kol: "2", naiyou: "重" },
    { code: 3, kol: "3", naiyou: "不良" }
  ]
);

export const babaSokudo = new Codes(
  [
    { code: 0, kol: "0", naiyou: "普通" },
    { code: 1, kol: "1", naiyou: "速い" },
    { code: 2, kol: "2", naiyou: "遅い" }
  ]
);

export const ichi = new Codes(
  [
    { code: 1, kol: /遅れ|スタート|ゲート|ダッシュ|アオ|外枠|好発/, naiyou: "スタート" },
    { code: 4, kol: /障害|バンケット|水ごう/, naiyou: "障害" },
    { code: 2, kol: /正面|直線|ゴール|スタンド/, naiyou: "直線" },
    { code: 3, kol: /角|コーナ/, naiyou: "コーナ" },
    { code: 5, kol: /.+/, naiyou: "道中" }
  ]
);

export const joukyou = new Codes(
  [
    { code: 50, kol: /好発/, naiyou: "好発" },
    { code: 41, kol: /遅れ|スタート|ゲート|ダッシュ|アオ/, naiyou: "出遅れ" },
    { code: 42, kol: /外枠/, naiyou: "外枠発走" },
    { code: 31, kol: /落馬/, naiyou: "落馬" },
    { code: 33, kol: /中止/, naiyou: "中止" },
    { code: 43, kol: /ふくれる|ササる|ささる|ヨレる|よれる|斜行|内ラチ|切れる/, naiyou: "斜行" },
    { code: 44, kol: /不利/, naiyou: "アクシデント" },
    { code: 99, kol: /.+/, naiyou: "その他" }
  ]
);

export const trackBias = new Codes(
  [
    { code: 1, jrdb: "1", naiyou: "良好" },
    { code: 2, jrdb: "2", naiyou: "硬い馬場" },
    { code: 3, jrdb: "3", naiyou: "普通" },
    { code: 4, jrdb: "4", naiyou: "荒れ馬場" },
    { code: 5, jrdb: "5", naiyou: "ボロボロの馬場" }
  ]
);

export enum Midashi {
  DaiichiCorner = 1,
  DainiCorner,
  MukouJoumen,
  DaisanCorner,
  DaiyonCorner,
  Chokusen
}

export const midashi = new Codes(
  [
    { code: Midashi.DaiichiCorner, jrdb: "1", naiyou: "1角" },
    { code: Midashi.DainiCorner, jrdb: "2", naiyou: "2角" },
    { code: Midashi.MukouJoumen, jrdb: "3", naiyou: "向正" },
    { code: Midashi.DaisanCorner, jrdb: "4", naiyou: "3角" },
    { code: Midashi.DaiyonCorner, jrdb: "5", naiyou: "4角" },
    { code: Midashi.Chokusen, jrdb: "6", naiyou: "直線" }
  ]
);