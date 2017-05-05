import { Codes } from "./Codes";

export const umaKigou = new Codes(
  [
    { code: 1, kol: "01", jrdb: "01", naiyou: "○抽" },
    { code: 2, kol: "02", jrdb: "02", naiyou: "□抽" },
    { code: 3, kol: "03", jrdb: "03", naiyou: "○父" },
    { code: 4, kol: "04", jrdb: "04", naiyou: "○市" },
    { code: 5, kol: "05", jrdb: "05", naiyou: "○地" },
    { code: 6, kol: "06", jrdb: "06", naiyou: "○外" },
    { code: 7, kol: "07", jrdb: "07", naiyou: "○父○抽" },
    { code: 8, kol: "08", jrdb: "08", naiyou: "○父○市" },
    { code: 9, kol: "09", jrdb: "09", naiyou: "○父○地" },
    { code: 10, kol: "10", jrdb: "10", naiyou: "○市○地" },
    { code: 11, kol: "11", jrdb: "11", naiyou: "○外○地" },
    { code: 12, kol: "12", jrdb: "12", naiyou: "○父○市○地" },
    { code: 15, kol: "15", jrdb: "15", naiyou: "○招" },
    { code: 16, kol: "16", jrdb: "16", naiyou: "○招○外" },
    { code: 17, kol: "17", jrdb: "17", naiyou: "○招○父" },
    { code: 18, kol: "18", jrdb: "18", naiyou: "○招○市" },
    { code: 19, kol: "19", jrdb: "19", naiyou: "○招○父○市" },
    { code: 20, kol: "20", jrdb: "20", naiyou: "○父○外" },
    { code: 21, kol: "21", jrdb: "21", naiyou: "□地" },
    { code: 22, kol: "22", jrdb: "22", naiyou: "○外□地" },
    { code: 23, kol: "23", jrdb: "23", naiyou: "○父□地" },
    { code: 24, kol: "24", jrdb: "24", naiyou: "○市□地" },
    { code: 25, kol: "25", jrdb: "25", naiyou: "○父○市□地" },
    { code: 26, kol: "26", jrdb: "26", naiyou: "□外" },
    { code: 27, kol: "27", jrdb: "27", naiyou: "○父□外" },
    { code: 40, kol: "40", naiyou: "○父○外○地" },
    { code: 41, kol: "41", naiyou: "○父○外□地" }
  ]
);

export const seibetsu = new Codes(
  [
    { code: 0, kol: "0", jrdb: "1", naiyou: "牡" },
    { code: 1, kol: "1", jrdb: "2", naiyou: "牝" },
    { code: 2, kol: "2", jrdb: "3", naiyou: "せん" }
  ]
);

export const keiro = new Codes(
  [
    { code: 1, kol: "01", naiyou: "栗" },
    { code: 2, kol: "02", naiyou: "栃栗" },
    { code: 3, kol: ["03", "23", "28", "30"], naiyou: "鹿" },
    { code: 4, kol: ["04", "20", "24", "31", "32", "33", "34", "35"], naiyou: "黒鹿" },
    { code: 5, kol: "05", naiyou: "青鹿" },
    { code: 6, kol: "06", naiyou: "青" },
    { code: 7, kol: ["07", "21", "22", "25", "26", "27", "29"], naiyou: "芦" },
    { code: 8, kol: "08", naiyou: "栗粕" },
    { code: 9, kol: "09", naiyou: "鹿粕" },
    { code: 10, kol: "10", naiyou: "青粕" },
    { code: 11, kol: "11", naiyou: "白" },
    { code: 12, kol: "12", naiyou: "芦鹿" },
    { code: 13, kol: "13", naiyou: "粕" }
  ]
);

export const kesshu = new Codes(
  [
    { code: 1, kol: "01", naiyou: "サラ" },
    { code: 2, kol: "02", naiyou: "アラ" },
    { code: 3, kol: "03", naiyou: "アア" },
    { code: 4, kol: ["04", "50"], naiyou: "サラ系" },
    { code: 5, kol: "05", naiyou: "アラ系" },
    { code: 7, kol: "07", naiyou: "軽半" },
    { code: 8, kol: "08", naiyou: "中半" },
    { code: 10, kol: "10", naiyou: "重半" },
    { code: 11, kol: "11", naiyou: "アノ" },
    { code: 12, kol: "12", naiyou: "アノ系" },
    { code: 13, kol: "13", naiyou: "クリ" },
    { code: 14, kol: "14", naiyou: "クリ系" },
    { code: 15, kol: "15", naiyou: "トロ" },
    { code: 16, kol: "16", naiyou: "トロ系" },
    { code: 17, kol: "17", naiyou: "ノニ" },
    { code: 18, kol: "18", naiyou: "ノニ系" },
    { code: 19, kol: "19", naiyou: "ハク" },
    { code: 20, kol: "20", naiyou: "ハク系" }
  ]
);

export const sanch = new Codes(
  [
    { code: 0, kol: "000", naiyou: "北檜山" },
    { code: 1, kol: "001", naiyou: "えりも" },
    { code: 2, kol: "002", naiyou: "様似" },
    { code: 3, kol: "003", naiyou: "浦河" },
    { code: 4, kol: "004", naiyou: "三石" },
    { code: 5, kol: "005", naiyou: "静内" },
    { code: 6, kol: "006", naiyou: "新冠" },
    { code: 7, kol: "007", naiyou: "門別" },
    { code: 8, kol: "008", naiyou: "平取" },
    { code: 9, kol: "009", naiyou: "鵡川" },
    { code: 10, kol: "010", naiyou: "早来" },
    { code: 11, kol: "011", naiyou: "白老" },
    { code: 12, kol: "012", naiyou: "室蘭" },
    { code: 13, kol: "013", naiyou: "伊達" },
    { code: 14, kol: "014", naiyou: "虻田" },
    { code: 15, kol: "015", naiyou: "幕別" },
    { code: 16, kol: "016", naiyou: "厚真" },
    { code: 17, kol: "017", naiyou: "網走" },
    { code: 18, kol: "018", naiyou: "池田" },
    { code: 19, kol: "019", naiyou: "有珠" },
    { code: 20, kol: "020", naiyou: "浦幌" },
    { code: 21, kol: "021", naiyou: "恵庭" },
    { code: 22, kol: "022", naiyou: "江別" },
    { code: 23, kol: "023", naiyou: "追別" },
    { code: 24, kol: "024", naiyou: "長万部" },
    { code: 25, kol: "025", naiyou: "音更" },
    { code: 26, kol: "026", naiyou: "音別" },
    { code: 27, kol: "027", naiyou: "帯広" },
    { code: 28, kol: "028", naiyou: "河西" },
    { code: 29, kol: "029", naiyou: "釧路" },
    { code: 30, kol: "030", naiyou: "栗山" },
    { code: 31, kol: "031", naiyou: "小清水" },
    { code: 32, kol: "032", naiyou: "札幌" },
    { code: 33, kol: "033", naiyou: "鹿追" },
    { code: 34, kol: "034", naiyou: "清水" },
    { code: 35, kol: "035", naiyou: "標茶" },
    { code: 36, kol: "036", naiyou: "白糠" },
    { code: 37, kol: "037", naiyou: "新得" },
    { code: 38, kol: "038", naiyou: "大樹" },
    { code: 39, kol: "039", naiyou: "鷹栖" },
    { code: 40, kol: "040", naiyou: "千歳" },
    { code: 41, kol: "041", naiyou: "忠類" },
    { code: 42, kol: "042", naiyou: "士幌" },
    { code: 43, kol: "043", naiyou: "弟子屈" },
    { code: 44, kol: "044", naiyou: "苫小牧" },
    { code: 45, kol: "045", naiyou: "豊浦" },
    { code: 46, kol: "046", naiyou: "豊頃" },
    { code: 47, kol: "047", naiyou: "根室" },
    { code: 48, kol: "048", naiyou: "登別" },
    { code: 49, kol: "049", naiyou: "函館" },
    { code: 50, kol: "050", naiyou: "浜中" },
    { code: 51, kol: "051", naiyou: "広尾" },
    { code: 52, kol: "052", naiyou: "深川" },
    { code: 53, kol: "053", naiyou: "穂別" },
    { code: 54, kol: "054", naiyou: "本別" },
    { code: 55, kol: "055", naiyou: "森" },
    { code: 56, kol: "056", naiyou: "八雲" },
    { code: 57, kol: "057", naiyou: "青森" },
    { code: 58, kol: "058", naiyou: "岩手" },
    { code: 59, kol: "059", naiyou: "宮城" },
    { code: 60, kol: "060", naiyou: "山形" },
    { code: 61, kol: "061", naiyou: "福島" },
    { code: 62, kol: "062", naiyou: "栃木" },
    { code: 63, kol: "063", naiyou: "群馬" },
    { code: 64, kol: "064", naiyou: "埼玉" },
    { code: 65, kol: "065", naiyou: "茨城" },
    { code: 66, kol: "066", naiyou: "千葉" },
    { code: 67, kol: "067", naiyou: "長野" },
    { code: 68, kol: "068", naiyou: "京都" },
    { code: 69, kol: "069", naiyou: "高知" },
    { code: 70, kol: "070", naiyou: "宮崎" },
    { code: 71, kol: "071", naiyou: "鹿児島" },
    { code: 72, kol: "072", naiyou: "熊本" },
    { code: 73, kol: "073", naiyou: "米国" },
    { code: 74, kol: "074", naiyou: "英国" },
    { code: 75, kol: "075", naiyou: "愛国" },
    { code: 76, kol: "076", naiyou: "仏国" },
    { code: 77, kol: "077", naiyou: "伊国" },
    { code: 78, kol: "078", naiyou: "独国" },
    { code: 79, kol: "079", naiyou: "カナダ" },
    { code: 80, kol: "080", naiyou: "新国" },
    { code: 81, kol: "081", naiyou: "豪州" },
    { code: 82, kol: "082", naiyou: "洞爺" },
    { code: 83, kol: "083", naiyou: "七飯" },
    { code: 84, kol: "084", naiyou: "上ノ国" },
    { code: 85, kol: "085", naiyou: "亜国" },
    { code: 86, kol: "086", naiyou: "白国" },
    { code: 87, kol: "087", naiyou: "瑞国" },
    { code: 88, kol: "088", naiyou: "壮瞥" },
    { code: 89, kol: "089", naiyou: "砂原" },
    { code: 90, kol: "090", naiyou: "足寄" },
    { code: 91, kol: "091", naiyou: "別海" },
    { code: 92, kol: "092", naiyou: "東京" },
    { code: 93, kol: "093", naiyou: "神奈川" },
    { code: 94, kol: "094", naiyou: "兵庫" },
    { code: 95, kol: "095", naiyou: "佐賀" },
    { code: 96, kol: "096", naiyou: "日高" },
    { code: 97, kol: "097", naiyou: "南郷" },
    { code: 98, kol: "098", naiyou: "更別" },
    { code: 99, kol: "099", naiyou: "チリ" },
    { code: 100, kol: "100", naiyou: "遠別" },
    { code: 101, kol: "101", naiyou: "芽室" },
    { code: 102, kol: "102", naiyou: "中標津" },
    { code: 103, kol: "103", naiyou: "山梨" },
    { code: 104, kol: "104", naiyou: "伯国" },
    { code: 105, kol: "105", naiyou: "今金" },
    { code: 106, kol: "106", naiyou: "厚岸" },
    { code: 107, kol: "107", naiyou: "東久留" },
    { code: 108, kol: "108", naiyou: "標津" },
    { code: 109, kol: "109", naiyou: "大分" },
    { code: 110, kol: "110", naiyou: "静岡" },
    { code: 111, kol: "111", naiyou: "由仁" },
    { code: 112, kol: "112", naiyou: "木古内" },
    { code: 113, kol: "113", naiyou: "幌泉" },
    { code: 114, kol: "114", naiyou: "比国" },
    { code: 115, kol: "115", naiyou: "星国" },
    { code: 116, kol: "116", naiyou: "ＵＡＥ" },
    { code: 117, kol: "117", naiyou: "広島" },
    { code: 118, kol: "118", naiyou: "南ア国" },
    { code: 119, kol: "119", naiyou: "むかわ" },
    { code: 120, kol: "120", naiyou: "安平" },
    { code: 121, kol: "121", naiyou: "新ひだか" },
    { code: 122, kol: "122", naiyou: "洞爺湖" },
    { code: 123, kol: "123", naiyou: "露国" },
    { code: 124, kol: "124", naiyou: "秋田" },
    { code: 200, kol: "200", naiyou: "アルジ" },
    { code: 201, kol: "201", naiyou: "墺国" },
    { code: 202, kol: "202", naiyou: "バルバ" },
    { code: 203, kol: "203", naiyou: "ブルガ" },
    { code: 204, kol: "204", naiyou: "コロン" },
    { code: 205, kol: "205", naiyou: "キュー" },
    { code: 206, kol: "206", naiyou: "キプロ" },
    { code: 207, kol: "207", naiyou: "チェコ" },
    { code: 208, kol: "208", naiyou: "丁国" },
    { code: 209, kol: "209", naiyou: "東独国" },
    { code: 210, kol: "210", naiyou: "エクア" },
    { code: 211, kol: "211", naiyou: "埃国" },
    { code: 212, kol: "212", naiyou: "希国" },
    { code: 213, kol: "213", naiyou: "蘭国" },
    { code: 214, kol: "214", naiyou: "香港" },
    { code: 215, kol: "215", naiyou: "洪国" },
    { code: 216, kol: "216", naiyou: "印度" },
    { code: 217, kol: "217", naiyou: "インド" },
    { code: 218, kol: "218", naiyou: "イラン" },
    { code: 219, kol: "219", naiyou: "イスラ" },
    { code: 220, kol: "220", naiyou: "ジャマ" },
    { code: 221, kol: "221", naiyou: "日本" },
    { code: 222, kol: "222", naiyou: "ケニア" },
    { code: 223, kol: "223", naiyou: "レバノ" },
    { code: 224, kol: "224", naiyou: "リベア" },
    { code: 225, kol: "225", naiyou: "ルクセ" },
    { code: 226, kol: "226", naiyou: "マレー" },
    { code: 227, kol: "227", naiyou: "マルタ" },
    { code: 229, kol: "229", naiyou: "モーリ" },
    { code: 230, kol: "230", naiyou: "メキシ" },
    { code: 231, kol: "231", naiyou: "モロコ" },
    { code: 232, kol: "232", naiyou: "ノルウ" },
    { code: 233, kol: "233", naiyou: "パキス" },
    { code: 234, kol: "234", naiyou: "パナマ" },
    { code: 235, kol: "235", naiyou: "秘国" },
    { code: 236, kol: "236", naiyou: "比国" },
    { code: 237, kol: "237", naiyou: "波国" },
    { code: 238, kol: "238", naiyou: "葡国" },
    { code: 239, kol: "239", naiyou: "プエル" },
    { code: 240, kol: "240", naiyou: "羅国" },
    { code: 241, kol: "241", naiyou: "シンガ" },
    { code: 242, kol: "242", naiyou: "南阿国" },
    { code: 243, kol: "243", naiyou: "ソ連" },
    { code: 244, kol: "244", naiyou: "西国" },
    { code: 245, kol: "245", naiyou: "スリラ" },
    { code: 246, kol: "246", naiyou: "スーダ" },
    { code: 247, kol: "247", naiyou: "スイス" },
    { code: 248, kol: "248", naiyou: "トリニ" },
    { code: 249, kol: "249", naiyou: "チュニ" },
    { code: 250, kol: "250", naiyou: "土国" },
    { code: 251, kol: "251", naiyou: "ウルグ" },
    { code: 252, kol: "252", naiyou: "ペネズ" },
    { code: 253, kol: "253", naiyou: "ユーゴ" },
    { code: 254, kol: "254", naiyou: "ジンバ" },
    { code: 255, kol: "255", naiyou: "ロシア" },
    { code: 256, kol: "256", naiyou: "シリア" },
    { code: 257, kol: "257", naiyou: "沙国" },
    { code: 258, kol: ["126", "258"], naiyou: "韓国" },
    { code: 259, kol: "259", naiyou: "中国" }
  ]
);

export const masshouFlag = new Codes(
  [
    { code: 1, kol: "1", naiyou: "抹消" }
  ]
);

export const keitou = new Codes(
  [
    { code: 1101, jrdb: "1101", naiyou: "ノーザンダンサー系" },
    { code: 1102, jrdb: "1102", naiyou: "ニジンスキー系" },
    { code: 1103, jrdb: "1103", naiyou: "ヴァイスリージェント系" },
    { code: 1104, jrdb: "1104", naiyou: "リファール系" },
    { code: 1105, jrdb: "1105", naiyou: "ノーザンテースト系" },
    { code: 1106, jrdb: "1106", naiyou: "ダンジグ系" },
    { code: 1107, jrdb: "1107", naiyou: "ヌレイエフ系" },
    { code: 1108, jrdb: "1108", naiyou: "ストームバード系" },
    { code: 1109, jrdb: "1109", naiyou: "サドラーズウェルズ系" },
    { code: 1201, jrdb: "1201", naiyou: "ロイヤルチャージャー系" },
    { code: 1202, jrdb: "1202", naiyou: "ターントゥ系" },
    { code: 1203, jrdb: "1203", naiyou: "ヘイルトゥリーズン系" },
    { code: 1204, jrdb: "1204", naiyou: "サーゲイロード系" },
    { code: 1205, jrdb: "1205", naiyou: "ハビタット系" },
    { code: 1206, jrdb: "1206", naiyou: "ヘイロー系" },
    { code: 1207, jrdb: "1207", naiyou: "ロベルト系" },
    { code: 1301, jrdb: "1301", naiyou: "ナスルーラ系" },
    { code: 1302, jrdb: "1302", naiyou: "グレイソヴリン系" },
    { code: 1303, jrdb: "1303", naiyou: "ネヴァーベンド系" },
    { code: 1304, jrdb: "1304", naiyou: "プリンスリーギフト系" },
    { code: 1305, jrdb: "1305", naiyou: "ボールドルーラー系" },
    { code: 1306, jrdb: "1306", naiyou: "レッドゴッド系" },
    { code: 1307, jrdb: "1307", naiyou: "ゼダーン系" },
    { code: 1308, jrdb: "1308", naiyou: "カロ系" },
    { code: 1309, jrdb: "1309", naiyou: "ミルリーフ系" },
    { code: 1310, jrdb: "1310", naiyou: "リヴァーマン系" },
    { code: 1311, jrdb: "1311", naiyou: "シアトルスルー系" },
    { code: 1312, jrdb: "1312", naiyou: "ブラッシンググルーム系" },
    { code: 1401, jrdb: "1401", naiyou: "ネアルコ系" },
    { code: 1402, jrdb: "1402", naiyou: "ニアークティック系" },
    { code: 1403, jrdb: "1403", naiyou: "デリングドゥ系" },
    { code: 1501, jrdb: "1501", naiyou: "ネイティヴダンサー系" },
    { code: 1502, jrdb: "1502", naiyou: "シャーペンアップ系" },
    { code: 1503, jrdb: "1503", naiyou: "ミスタープロスペクター系" },
    { code: 1601, jrdb: "1601", naiyou: "フェアウェイ系" },
    { code: 1602, jrdb: "1602", naiyou: "バックパサー系" },
    { code: 1603, jrdb: "1603", naiyou: "ファラリス系" },
    { code: 1701, jrdb: "1701", naiyou: "ダマスカス系" },
    { code: 1702, jrdb: "1702", naiyou: "テディ系" },
    { code: 1801, jrdb: "1801", naiyou: "ハイペリオン系" },
    { code: 1802, jrdb: "1802", naiyou: "オリオール系" },
    { code: 1803, jrdb: "1803", naiyou: "ロックフェラ系" },
    { code: 1804, jrdb: "1804", naiyou: "テューダーミンストレル系" },
    { code: 1805, jrdb: "1805", naiyou: "オーエンテューダー系" },
    { code: 1806, jrdb: "1806", naiyou: "スターキングダム系" },
    { code: 1807, jrdb: "1807", naiyou: "フォルリ系" },
    { code: 1901, jrdb: "1901", naiyou: "エクリプス系" },
    { code: 1902, jrdb: "1902", naiyou: "ブランドフォード系" },
    { code: 1903, jrdb: "1903", naiyou: "ドンカスター系" },
    { code: 1904, jrdb: "1904", naiyou: "ドミノ系" },
    { code: 1905, jrdb: "1905", naiyou: "ヒムヤー系" },
    { code: 1906, jrdb: "1906", naiyou: "エルバジェ系" },
    { code: 1907, jrdb: "1907", naiyou: "ダークロナルド系" },
    { code: 1908, jrdb: "1908", naiyou: "ファイントップ系" },
    { code: 1909, jrdb: "1909", naiyou: "ゲインズボロー系" },
    { code: 1910, jrdb: "1910", naiyou: "ハーミット系" },
    { code: 1911, jrdb: "1911", naiyou: "アイシングラス系" },
    { code: 1912, jrdb: "1912", naiyou: "コングリーヴ系" },
    { code: 1913, jrdb: "1913", naiyou: "ロックサンド系" },
    { code: 2001, jrdb: "2001", naiyou: "セントサイモン系" },
    { code: 2002, jrdb: "2002", naiyou: "リボー系" },
    { code: 2003, jrdb: "2003", naiyou: "ヒズマジェスティ系" },
    { code: 2004, jrdb: "2004", naiyou: "グロースターク系" },
    { code: 2005, jrdb: "2005", naiyou: "トムロルフ系" },
    { code: 2006, jrdb: "2006", naiyou: "ワイルドリスク系" },
    { code: 2007, jrdb: "2007", naiyou: "チャウサー系" },
    { code: 2008, jrdb: "2008", naiyou: "プリンスローズ系" },
    { code: 2009, jrdb: "2009", naiyou: "プリンスキロ系" },
    { code: 2010, jrdb: "2010", naiyou: "ラウンドテーブル系" },
    { code: 2101, jrdb: "2101", naiyou: "マッチェム系" },
    { code: 2102, jrdb: "2102", naiyou: "フェアプレイ系" },
    { code: 2103, jrdb: "2103", naiyou: "ハリーオン系" },
    { code: 2104, jrdb: "2104", naiyou: "マンノウォー系" },
    { code: 2105, jrdb: "2105", naiyou: "インリアリティ系" },
    { code: 2201, jrdb: "2201", naiyou: "パーソロン系" },
    { code: 2202, jrdb: "2202", naiyou: "リュティエ系" },
    { code: 2203, jrdb: "2203", naiyou: "ジェベル系" },
    { code: 2204, jrdb: "2204", naiyou: "トウルビヨン系" },
    { code: 2205, jrdb: "2205", naiyou: "ザテトラーク系" },
    { code: 2206, jrdb: "2206", naiyou: "ヘロド系" },
    { code: 2301, jrdb: "2301", naiyou: "サンドリッジ系" },
    { code: 2401, jrdb: "2401", naiyou: "スウィンフォード系" },
    { code: 9901, jrdb: "9901", naiyou: "アラ系" }
  ]
);

export const daiKeitou = new Codes(
  [
    {
      code: 1100,
      jrdb: [
        "1101", "1102", "1103", "1104", "1105", "1106", "1107", "1108", "1109"
      ],
      naiyou: "ノーザンダンサー系"
    },
    {
      code: 1200,
      jrdb: ["1201", "1202", "1203", "1204", "1205", "1206", "1207"],
      naiyou: "ロイヤルチャージャー系"
    },
    {
      code: 1300,
      jrdb: [
        "1301", "1302", "1303", "1304", "1305", "1306", "1307", "1308", "1309",
        "1310", "1311", "1312"
      ],
      naiyou: "ナスルーラ系"
    },
    { code: 1400, jrdb: ["1401", "1402", "1403"], naiyou: "ネアルコ系" },
    { code: 1500, jrdb: ["1501", "1502", "1503"], naiyou: "ネイティヴダンサー系" },
    { code: 1600, jrdb: ["1601", "1602", "1603"], naiyou: "フェアウェイ系" },
    { code: 1700, jrdb: ["1701", "1702"], naiyou: "ダマスカス系" },
    {
      code: 1800,
      jrdb: ["1801", "1802", "1803", "1804", "1805", "1806", "1807"],
      naiyou: "ハイペリオン系"
    },
    {
      code: 1900,
      jrdb: [
        "1901", "1902", "1903", "1904", "1905", "1906", "1907", "1908", "1909",
        "1910", "1911", "1912", "1913"
      ],
      naiyou: "エクリプス系"
    },
    {
      code: 2000,
      jrdb: [
        "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008",
        "2009", "2010"
      ],
      naiyou: "セントサイモン系"
    },
    {
      code: 2100,
      jrdb: ["2101", "2102", "2103", "2104", "2105"],
      naiyou: "マッチェム系"
    },
    {
      code: 2200,
      jrdb: ["2201", "2202", "2203", "2204", "2205", "2206"],
      naiyou: "パーソロン系"
    },
    { code: 2300, jrdb: "2301", naiyou: "サンドリッジ系" },
    { code: 2400, jrdb: "2401", naiyou: "スウィンフォード系" },
    { code: 9900, jrdb: "9901", naiyou: "アラ系" }
  ]
);

export const yunyuubaFlag = new Codes(
  [
    { code: 1, kol: "1", naiyou: "日本馬" },
    { code: 2, kol: "2", naiyou: "持込馬" },
    { code: 3, kol: "3", naiyou: "輸入馬" },
    { code: 4, kol: "4", naiyou: "招待馬" },
    { code: 5, kol: "5", naiyou: "外国馬" }
  ]
);