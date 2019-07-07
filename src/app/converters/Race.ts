import { Codes } from "./Codes";

export const ippanTokubetsu = new Codes(
  [
    { code: 1, kol: "1", jrdb: "5", jvdata: "E", naiyou: "特別" },
    { code: 2, kol: "2", jrdb: "6", jvdata: "D", naiyou: "準重賞" },
    { code: 3, kol: "3", jrdb: /1|2|3|4/, jvdata: /A|B|C|F|G|H/, naiyou: "重賞" },
    { code: 0, kol: "0", jrdb: /./, jvdata: /./, naiyou: "一般" },
  ]
);

export enum HeichiShougai {
  Heichi = 0,
  Shougai
}

export const heichiShougai = new Codes(
  [
    { code: HeichiShougai.Heichi, kol: "0", jrdb: /1|2/, jvdata:/[12]./, naiyou: "平地" },
    { code: HeichiShougai.Shougai, kol: "1", jrdb: "3", jvdata:/5./, naiyou: "障害" }
  ]
);

export const grade = new Codes(
  [
    { code: 1, kol: /0|3/, jrdb: "1", jvdata: /A|F/, naiyou: "G1" },
    { code: 2, kol: /1|4/, jrdb: "2", jvdata: /B|G/, naiyou: "G2" },
    { code: 3, kol: /2|5/, jrdb: "3", jvdata: /C|H/, naiyou: "G3" },
    { code: 4, jrdb: "6", naiyou: "L", jvdata: "D" },
  ]
);

export const jpnFlag = new Codes(
  [
    { code: 1, kol: "1", naiyou: "Jpn" },
  ]
);

export const betteiBareiHandi = new Codes(
  [
    { code: 0, kol: /^(00|別定)$/, jrdb: "2", jvdata:"2", naiyou: "別定" },
    { code: 1, kol: /^(01|馬齢)$/, jrdb: "3", jvdata:"3", naiyou: "馬齢" },
    { code: 2, kol: /^(02|ハンデ)$/, jrdb: "1", jvdata:"1", naiyou: "ハンデ" },
    { code: 3, kol: /^(03|定量)$/, jrdb: "4", jvdata:"4", naiyou: "定量" },
    { code: 4, kol: /^(90|規定)$/, naiyou: "規定" }
  ]
);

export const joukenSaraKei = new Codes(
  [
    { code: 1, kol: /0|1|2|3|4|8|9|B|K/, jrdb: /11|12|13|14|18|19/, naiyou: "サラ系" },
  ]
);

export const joukenAraKei = new Codes(
  [
    { code: 1, kol: /5|6|7|A|C/, jrdb: /21|22|23|24/, naiyou: "アラブ系" },
  ]
);

export const joukenBoba = new Codes(
  [
    { code: 1, kol: /24|27|28|33|38|40/, jrdb: /.[134]./, jvdata: /.[134]./, naiyou: "牡" },
  ]
);

export const joukenHinba = new Codes(
  [
    { code: 1, kol: /03|10|33|35|38|40/, jrdb: /.[24]./, jvdata: /.[24]./, naiyou: "牝" },
  ]
);

export const joukenSenba = new Codes(
  [
    { code: 1, kol: /24|27|28/, jrdb: /.3./, jvdata: /.3./, naiyou: "せん" },
  ]
);

export const joukenMaruKon = new Codes(
  [
    { code: 1, kol: /04|08|10|13|27|38/, jrdb: /1../, jvdata: /A../, naiyou: "(混)" },
  ]
);

export const joukenMaruChichi = new Codes(
  [
    { code: 1, kol: "05", jrdb: /2../, jvdata: /B../, naiyou: "(父)" },
  ]
);

export const joukenMaruIchi = new Codes(
  [
    { code: 1, kol: /07|11|19|20/, jrdb: /3../, jvdata: /[CFKL]../, naiyou: "(市)" },
  ]
);

export const joukenMaruChuu = new Codes(
  [
    { code: 1, kol: /09|14|15|16|19|20/, jrdb: /3../, jvdata: /[DFGHKL]../, naiyou: "(抽)" },
  ]
);

export const joukenKakuChuu = new Codes(
  [
    { code: 1, kol: /06|07|17|18/, jvdata: /[EIJ]../, naiyou: "[抽]" },
  ]
);

export const joukenMaruKokusai = new Codes(
  [
    { code: 1, kol: /29|35|40/, jrdb: /5../, jvdata: /N../, naiyou: "(国際)" },
  ]
);

export const joukenMaruShou = new Codes(
  [
    { code: 1, kol: "12", naiyou: "(招)" },
  ]
);

export const joukenMaruShi = new Codes(
  [
    { code: 1, kol: /^(13|21|30|1|4)$/, jrdb: /..1/, jvdata: /..1/, naiyou: "(指)" },
  ]
);

export const joukenMaruTokuShi = new Codes(
  [
    { code: 1, kol: /^(31|2)$/, jrdb: /..3/, jvdata: /..4/, naiyou: "(特指)" },
  ]
);

export const joukenKakuShi = new Codes(
  [
    { code: 1, kol: /^(32|3)$/, jrdb: /..2/, jvdata: /..3/, naiyou: "[指]" },
  ]
);

export const joukenShounyuu = new Codes(
  [
    { code: 1, kol: /00|08|14/, naiyou: "勝入" },
  ]
);

export const joukenNaikokusan = new Codes(
  [
    { code: 1, kol: "02", naiyou: "内国" },
  ]
);

export const joukenKouryuu = new Codes(
  [
    { code: 1, kol: /^(25|1)$/, jrdb: /..[1-4]/, naiyou: "交流" },
  ]
);

export const joukenWakate = new Codes(
  [
    { code: 1, jrdb: /..4/, jvdata: /..2/, naiyou: "若手" },
  ]
);

export const joukenKyuushuusan = new Codes(
  [
    { code: 1, kol: "01", jrdb: /4../, jvdata: /M../, naiyou: "九州産" },
  ]
);

export const joukenChibasan = new Codes(
  [
    { code: 1, kol: "26", naiyou: "千葉産" },
  ]
);

export const joukenKansaiHaifuba = new Codes(
  [
    { code: 1, kol: /15|17|19/, jvdata: /[GIK]../, naiyou: "関西配布馬" },
  ]
);

export const joukenKantouHaifuba = new Codes(
  [
    { code: 1, kol: /16|18|20/, jvdata: /[HJL]../, naiyou: "関東配布馬" },
  ]
);

export const joukenJraNintei = new Codes(
  [
    { code: 1, kol: "34", naiyou: "JRA認定" },
  ]
);

export const joukenJraShitei = new Codes(
  [
    { code: 1, kol: "39", naiyou: "JRA指定" },
  ]
);

export const joukenAshige = new Codes(
  [
    { code: 1, kol: "22", naiyou: "芦毛" },
  ]
);

export const joukenKurige = new Codes(
  [
    { code: 1, kol: "23", naiyou: "栗毛" },
  ]
);

export const joukenAshigeShiroge = new Codes(
  [
    { code: 1, kol: "36", naiyou: "芦・白" },
  ]
);

export const joukenKurokage = new Codes(
  [
    { code: 1, kol: "37", naiyou: "黒鹿毛" },
  ]
);

export const joukenSeed = new Codes(
  [
    { code: 1, kol: "1", naiyou: "シード" }
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

export const joukenNenreiSeigenFromJoukenCut = new Codes(
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
    { code: 400, kol: "04000", jrdb: "04", jvdata:"004", naiyou: "400万" },
    { code: 500, kol: "05000", jrdb: "05", jvdata:"005", naiyou: "500万" },
    { code: 800, kol: "08000", jrdb: "08", jvdata:"008", naiyou: "800万" },
    { code: 900, kol: "09000", jrdb: "09", jvdata:"009", naiyou: "900万" },
    { code: 1000, kol: "10000", jrdb: "10", jvdata:"010", naiyou: "1000万" },
    { code: 1500, kol: "15000", jrdb: "15", jvdata:"015", naiyou: "1500万" },
    { code: 1600, kol: "16000", jrdb: "16", jvdata:"016", naiyou: "1600万" },
    { code: -13, kol: "-0013", jrdb: "A2", jvdata:"702", naiyou: "未出" },
    { code: -14, kol: "-0014", jrdb: "A3", jvdata:"703", naiyou: "未勝" },
    { code: -15, kol: "-0015", jrdb: "A1", jvdata:"701", naiyou: "新馬" },
    { code: -16, kol: "-0016", jrdb: "OP", jvdata:"999", naiyou: "オープン" },
    { code: -42, kol: "-0042", naiyou: "3才" },
    { code: -43, kol: "-0043", naiyou: "4才" },
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
        if (100 <= num) return num / 10;
        return null;
      },
      jrdb: (str: string) => {
        const num = parseInt(str);
        if (num <= 100) return num * 100;
        return null;
      },
      jvdata: (str: string) => {
        const num = parseInt(str);
        if (num <= 100) return num * 100;
        return null;
      },
      naiyou: (code: number) => {
        if (100 <= code) return code + "万";
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

export enum DirtShiba {
  Dirt = 0,
  Shiba
}

export const dirtShiba = new Codes(
  [
    { code: DirtShiba.Dirt, kol: "0", jrdb: "2", jvdata:/2[3-9]/, naiyou: "ダート" },
    { code: DirtShiba.Shiba, kol: "1", jrdb: "1", jvdata:/(1[0-9])|(2[0-2])|(5[1-9])/, naiyou: "芝" }
  ]
);

export const migiHidari = new Codes(
  [
    { code: 0, kol: "0", jrdb: "1", naiyou: "右" },
    { code: 1, kol: "1", jrdb: "2", naiyou: "左" },
    { code: 2, kol: "2", jrdb: "3", naiyou: "直線" }
  ]
);

export const uchiSoto = new Codes(
  [
    { code: 0, kol: "0", jrdb: "1", naiyou: "内" },
    { code: 1, kol: "1", jrdb: "2", naiyou: "外" },
    { code: 2, kol: "2", naiyou: "外→内" },
    { code: 3, kol: "3", naiyou: "タヌキ" },
    { code: 4, kol: "4", naiyou: "大障害" },
    { code: 5, kol: "5", naiyou: "内2周" },
    { code: 6, kol: "6", naiyou: "内→外" }
  ]
);

export const course = new Codes(
  [
    { code: 0, kol: "0", jrdb: "1", naiyou: "A" },
    { code: 1, kol: "1", jrdb: "4", naiyou: "B" },
    { code: 2, kol: "2", jrdb: "5", naiyou: "C" },
    { code: 3, kol: "3", jrdb: "6", naiyou: "D" },
    { code: 4, kol: "4", jrdb: "2", naiyou: "A1" },
    { code: 5, kol: "5", naiyou: "B1" },
    { code: 6, jrdb: "3", naiyou: "A2" },
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
    { code: 0, kol: "0", jrdb: "H", naiyou: "H" },
    { code: 1, kol: "1", jrdb: "M", naiyou: "M" },
    { code: 2, kol: "2", jrdb: "S", naiyou: "S" }
  ]
);

export const tenki = new Codes(
  [
    { code: 0, kol: "0", jrdb: "1", jvdata:"1", naiyou: "晴" },
    { code: 1, kol: "1", jrdb: "2", jvdata:"2", naiyou: "曇" },
    { code: 2, kol: "2", jrdb: "4", jvdata:"3", naiyou: "雨" },
    { code: 3, kol: "3", jrdb: "3", jvdata:"4", naiyou: "小雨" },
    { code: 4, kol: "4", jrdb: "6", jvdata:"5", naiyou: "雪" },
    { code: 5, kol: "5", naiyou: "風" },
    { code: 6, kol: "6", jrdb: "5", jvdata:"6", naiyou: "小雪" }
  ]
);

export const baba = new Codes(
  [
    { code: 0, kol: "0", jrdb: "1", jvdata:"1", naiyou: "良" },
    { code: 1, kol: "1", jrdb: "2", jvdata:"2", naiyou: "稍重" },
    { code: 2, kol: "2", jrdb: "3", jvdata:"3", naiyou: "重" },
    { code: 3, kol: "3", jrdb: "4", jvdata:"4", naiyou: "不良" }
  ]
);

export const babaSokudo = new Codes(
  [
    { code: 0, jrdb: "0", naiyou: "普通" },
    { code: 1, jrdb: "1", naiyou: "速い" },
    { code: 2, jrdb: "2", naiyou: "遅い" }
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