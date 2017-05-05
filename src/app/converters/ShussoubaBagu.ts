import { Codes } from "./Codes";

export const baguShubetsu = new Codes(
  [
    {
      code: 1,
      jrdb: [
        "003", "004", "005", "006", "010", "013", "014", "015", "016", "040",
        "044", "067", "072", "088", "089", "090", "092", "097"
      ],
      naiyou: "ハミ"
    },
    {
      code: 2,
      kol: "1",
      jrdb: [
        "001", "002", "008", "009", "011", "012", "017", "018", "019", "020",
        "021", "022", "032", "036", "038", "039", "068", "069", "070", "071",
        "074", "079", "081", "082", "083", "096"
      ],
      naiyou: "その他馬具"
    },
    {
      code: 3,
      jrdb: [
        "047", "048", "049", "050", "054", "073", "077", "078", "085"
      ],
      naiyou: "蹄鉄"
    },
    {
      code: 4,
      jrdb: [
        "037", "056", "075", "076", "084", "091", "094", "095"
      ],
      naiyou: "蹄状態"
    },
    { code: 5, jrdb: ["045", "063", "064", "080"], naiyou: "ソエ状態" },
    { code: 6, jrdb: ["061", "062"], naiyou: "骨瘤" },
    {
      code: 7,
      jrdb: [
        "023", "024", "025", "026", "028", "030", "041", "042", "043"
      ],
      naiyou: "馬状態"
    },
    { code: 8, jrdb: "007", naiyou: "バンテージ" }
  ]
);

export const bagu = new Codes(
  [
    { code: 1, kol: "1", jrdb: "001", naiyou: "ブリンカー", tanshuku: "ブ" },
    { code: 2, jrdb: "002", naiyou: "シャドーロール", tanshuku: "鼻" },
    { code: 3, jrdb: "003", naiyou: "リングハミ", tanshuku: "R" },
    { code: 4, jrdb: "004", naiyou: "Dハミ", tanshuku: "D" },
    { code: 5, jrdb: "005", naiyou: "エッグハミ", tanshuku: "E" },
    { code: 6, jrdb: "006", naiyou: "枝ハミ", tanshuku: "枝" },
    { code: 7, jrdb: "007", naiyou: "バンテージ", tanshuku: "バ" },
    { code: 8, jrdb: "008", naiyou: "メンコ", tanshuku: "面" },
    { code: 9, jrdb: "009", naiyou: "ガムチェーン", tanshuku: "G" },
    { code: 10, jrdb: "010", naiyou: "ハートハミ", tanshuku: "H" },
    { code: 11, jrdb: "011", naiyou: "ハミ吊", tanshuku: "吊" },
    { code: 12, jrdb: "012", naiyou: "ビットガード", tanshuku: "ビ" },
    { code: 13, jrdb: "013", naiyou: "ノートンハミ", tanshuku: "ノ" },
    { code: 14, jrdb: "014", naiyou: "ジョウハミ", tanshuku: "ジ" },
    { code: 15, jrdb: "015", naiyou: "スライド", tanshuku: "ス" },
    { code: 16, jrdb: "016", naiyou: "てこハミ", tanshuku: "テ" },
    { code: 17, jrdb: "017", naiyou: "イタイタ", tanshuku: "痛" },
    { code: 18, jrdb: "018", naiyou: "ノーズバンド", tanshuku: "N" },
    { code: 19, jrdb: "019", naiyou: "チェーンシャンク", tanshuku: "C" },
    { code: 20, jrdb: "020", naiyou: "パドックブリンカー", tanshuku: "P" },
    { code: 21, jrdb: "021", naiyou: "舌くくる", tanshuku: "舌" },
    { code: 22, jrdb: "022", naiyou: "上唇くくる", tanshuku: "口" },
    { code: 23, jrdb: "023", naiyou: "馬気", tanshuku: "馬" },
    { code: 24, jrdb: "024", naiyou: "下痢", tanshuku: "下" },
    { code: 25, jrdb: "025", naiyou: "二度汗", tanshuku: "汗" },
    { code: 26, jrdb: "026", naiyou: "頭高い", tanshuku: "頭" },
    { code: 28, jrdb: "028", naiyou: "毛艶良い", tanshuku: "艶" },
    { code: 30, jrdb: "030", naiyou: "毛艶悪い", tanshuku: "毛" },
    { code: 32, jrdb: "032", naiyou: "引き返し", tanshuku: "引" },
    { code: 36, jrdb: "036", naiyou: "レバーノーズバンド", tanshuku: "レ" },
    { code: 37, jrdb: "037", naiyou: "保護テープ", tanshuku: "保" },
    { code: 38, jrdb: "038", naiyou: "キネトンノーズバンド", tanshuku: "キ" },
    { code: 39, jrdb: "039", naiyou: "アダプターパッド", tanshuku: "ア" },
    { code: 40, jrdb: "040", naiyou: "ノーマルハミポチつき", tanshuku: "ポ" },
    { code: 41, jrdb: "041", naiyou: "皮膚病", tanshuku: "皮" },
    { code: 42, jrdb: "042", naiyou: "玉腫れる", tanshuku: "玉" },
    { code: 43, jrdb: "043", naiyou: "フケ", tanshuku: "発" },
    { code: 44, jrdb: "044", naiyou: "スリーリングハミ", tanshuku: "T" },
    { code: 45, jrdb: "045", naiyou: "ソエ焼く", tanshuku: "焼" },
    { code: 47, jrdb: "047", naiyou: "半鉄", tanshuku: "半" },
    { code: 48, jrdb: "048", naiyou: "連尾鉄", tanshuku: "丸" },
    { code: 49, jrdb: "049", naiyou: "四分の三蹄鉄（曲）", tanshuku: "曲" },
    { code: 50, jrdb: "050", naiyou: "鉄橋鉄", tanshuku: "橋" },
    { code: 54, jrdb: "054", naiyou: "四分の三蹄鉄", tanshuku: "J" },
    { code: 55, jrdb: "055", naiyou: "目の下黒い", tanshuku: "黒" },
    { code: 56, jrdb: "056", naiyou: "エクイロックス", tanshuku: "エ" },
    { code: 61, jrdb: "061", naiyou: "骨瘤大", tanshuku: "骨" },
    { code: 62, jrdb: "062", naiyou: "骨瘤小", tanshuku: "小" },
    { code: 63, jrdb: "063", naiyou: "ソエ腫れ大", tanshuku: "腫" },
    { code: 64, jrdb: "064", naiyou: "ソエ腫れ小", tanshuku: "小" },
    { code: 67, jrdb: "067", naiyou: "サイテーションハミ", tanshuku: "サ" },
    { code: 68, jrdb: "068", naiyou: "ネックストラップ", tanshuku: "ネ" },
    { code: 69, jrdb: "069", naiyou: "ホライゾネット（レース）", tanshuku: "網" },
    { code: 70, jrdb: "070", naiyou: "ホライゾネット（パドック）", tanshuku: "網" },
    { code: 71, jrdb: "071", naiyou: "ハナゴム", tanshuku: "ゴ" },
    { code: 72, jrdb: "072", naiyou: "ユニバーサルハミ", tanshuku: "ユ" },
    { code: 73, jrdb: "073", naiyou: "蹄鉄なし", tanshuku: "裸" },
    { code: 74, jrdb: "074", naiyou: "チークピース", tanshuku: "ち" },
    { code: 75, jrdb: "075", naiyou: "追突防止パッド", tanshuku: "追" },
    { code: 76, jrdb: "076", naiyou: "新エクイロックス", tanshuku: "新" },
    { code: 77, jrdb: "077", naiyou: "スプーンヒール鉄", tanshuku: "ス" },
    { code: 78, jrdb: "078", naiyou: "柿元鉄", tanshuku: "柿" },
    { code: 79, jrdb: "079", naiyou: "耳当て", tanshuku: "耳" },
    { code: 80, jrdb: "080", naiyou: "体毛剃る", tanshuku: "剃" },
    { code: 81, jrdb: "081", naiyou: "プラスチックカップ", tanshuku: "プ" },
    { code: 82, jrdb: "082", naiyou: "マウスネット", tanshuku: "マ" },
    { code: 83, jrdb: "083", naiyou: "ブロウピース", tanshuku: "b" },
    { code: 84, jrdb: "084", naiyou: "ヒールパッド", tanshuku: "ひ" },
    { code: 85, jrdb: "085", naiyou: "リバーシブル鉄", tanshuku: "り" },
    { code: 87, jrdb: "087", naiyou: "歯ぎしり", tanshuku: "歯" },
    { code: 88, jrdb: "088", naiyou: "リーグルハミ", tanshuku: "リ" },
    { code: 89, jrdb: "089", naiyou: "ホートンハミ", tanshuku: "ほ" },
    { code: 90, jrdb: "090", naiyou: "トライアハミ", tanshuku: "ト" },
    { code: 91, jrdb: "091", naiyou: "シガフース蹄鉄", tanshuku: "シ" },
    { code: 92, jrdb: "092", naiyou: "ピーウィーハミ", tanshuku: "ぴ" },
    { code: 94, jrdb: "094", naiyou: "裂蹄", tanshuku: "裂" },
    { code: 95, jrdb: "095", naiyou: "蹄底パッド", tanshuku: "ぱ" },
    { code: 96, jrdb: "096", naiyou: "アイシールド", tanshuku: "あ" },
    { code: 97, jrdb: "097", naiyou: "e(HS社ハミ)", tanshuku: "e" }
  ]
);