import * as iconv from "iconv-lite";

const fromStrings = [
  "ｶﾞ", "ｷﾞ", "ｸﾞ", "ｹﾞ", "ｺﾞ", "ｻﾞ", "ｼﾞ", "ｽﾞ", "ｾﾞ", "ｿﾞ", "ﾀﾞ", "ﾁﾞ", "ﾂﾞ", "ﾃﾞ",
  "ﾄﾞ", "ﾊﾞ", "ﾋﾞ", "ﾌﾞ", "ﾍﾞ", "ﾎﾞ", "ﾊﾟ", "ﾋﾟ", "ﾌﾟ", "ﾍﾟ", "ﾎﾟ", "ｳﾞ"
];

const toStrings = [
  "ガ", "ギ", "グ", "ゲ", "ゴ", "ザ", "ジ", "ズ", "ゼ", "ゾ", "ダ", "ヂ", "ヅ", "デ",
  "ド", "バ", "ビ", "ブ", "ベ", "ボ", "パ", "ピ", "プ", "ペ", "ポ", "ヴ"
];

const fromChar = "　！”＃＄％＆’（）＊＋，－．／０１２３４５６７８９：；＜＝＞？＠ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ［￥］＾＿｀ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ｛｜｝￣“‘＼｡｢｣､･ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ";

const toChar = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\"'\\。「」、・ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン゛゜";

function normalize(str: string) {
  str = str.replace(/[\x00-\x1f\x7f-\x9f\s]+/g, " ");

  if (/^\s*$/.test(str)) {
    return null;
  }

  for (let i = 0; i < fromStrings.length; i++) {
    str = str.replace(fromStrings[i], toStrings[i]);
  }

  let normalized = "";
  for (let i = 0; i < str.length; i++) {
    const c = str.charAt(i);
    const index = fromChar.indexOf(c);
    if (0 <= index) {
      normalized += toChar.charAt(index);
    } else {
      normalized += c;
    }
  }

  return normalized.trim();
}

function format00(value: number): string {
  if (value < 10) return "0" + value;
  return "" + value;
}

export function toDateString(value: Date): string {
  return value.getFullYear() + "-" + format00(value.getMonth() + 1) + "-" + format00(value.getDate());
}

export function readRaw(buffer: Buffer, offset: number, length: number) {
  const chunk = new Buffer(length);
  buffer.copy(chunk, 0, offset, offset + length);
  const raw = iconv.decode(chunk, "Windows932");
  return raw;
}

export function readStr(buffer: Buffer, offset: number, length: number) {
  const raw = readRaw(buffer, offset, length);
  const normalized = normalize(raw);
  return normalized;
}

export function readStrWithNoSpace(buf: Buffer, offset: number, length: number) {
  const str = readStr(buf, offset, length);
  if (!str) {
    return null;
  }
  const converted = str.replace(/[\s]+/g, "");
  return converted;
}

export function readDouble(buf: Buffer, offset: number, length: number, mul?: number) {
  mul = (mul ? mul : 1.0);
  const str = readStr(buf, offset, length);
  const d = parseFloat(str);
  return isNaN(d) ? null : d * mul;
}

export function readInt(buf: Buffer, offset: number, length: number, mul?: number) {
  mul = mul < 1 ? mul | 0 : 1;
  const str = readStr(buf, offset, length);
  const i = parseInt(str);
  return isNaN(i) ? null : i * mul;
}

export function readTime(buf: Buffer, offset: number, length: number) {
  const i = readPositiveInt(buf, offset, length);
  if (!i) {
    return i;
  }
  const m = (i / 1000) | 0;
  const ssf = (i % 1000) / 10;
  const time = m * 60 + ssf;
  return time;
}

export function readPositiveInt(buf: Buffer, offset: number, length: number, mul?: number) {
  const i = readInt(buf, offset, length, mul);
  return i <= 0 ? null : i;
}

export function readDate(buf: Buffer, offset: number, length: number) {
  const i = readInt(buf, offset, length);
  if (i === null) {
    return null;
  }
  const year = (i / 10000) | 0;
  const month = ((i % 10000) / 100) | 0;
  const day = i % 100;
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) {
    return null;
  }
  return date;
}
