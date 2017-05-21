import { readRaw } from "../reader/ReadTool";

interface Code {
  code?: number;
  kol?: string | RegExp | ((str: string) => number);
  jrdb?: string | RegExp | ((str: string) => number);
  jravan?: string | RegExp | ((str: string) => number);
  naiyou?: string | ((code: number) => string);
  tanshuku?: string | ((code: number) => string);
}

export class Codes {
  private codes: Code[];

  constructor(codes: Code[]) {
    this.codes = codes;
  }

  protected getStr(buffer: Buffer | string, offset?: number, length?: number) {
    let str: string;
    if (buffer instanceof Buffer) {
      str = readRaw(buffer, offset, length);
    } else {
      str = buffer;
    }
    return str;
  }

  public toCodeFromKol(buffer: Buffer | string, offset?: number, length?: number) {
    const str = this.getStr(buffer, offset, length);
    return this.toCodeFrom("kol", str);
  }

  public toCodeFromJrdb(buffer: Buffer | string, offset?: number, length?: number) {
    const str = this.getStr(buffer, offset, length);
    return this.toCodeFrom("jrdb", str);
  }

  public toCodeFromJravan(buffer: Buffer | string, offset?: number, length?: number) {
    const str = this.getStr(buffer, offset, length);
    return this.toCodeFrom("jravan", str);
  }

  protected toCodeFrom(key: string, str: string) {
    for (let i = 0; i < this.codes.length; i++) {
      const c = this.codes[i];
      const member = c[key];
      const type = typeof member;
      if (type === "function") {
        return member(str);
      } else if (type === "object" && member.test(str)) {
        return c.code;
      } else if (member === str) {
        return c.code;
      }
    }
    return null;
  }

  public toCodesFromKol(buffer: Buffer | string, offset?: number, length?: number) {
    const str = this.getStr(buffer, offset, length);
    return this.toCodesFrom("kol", str);
  }

  public toCodesFromJrdb(buffer: Buffer | string, offset?: number, length?: number) {
    const str = this.getStr(buffer, offset, length);
    return this.toCodesFrom("jrdb", str);
  }

  public toCodesFromJravan(buffer: Buffer | string, offset?: number, length?: number) {
    const str = this.getStr(buffer, offset, length);
    return this.toCodesFrom("jravan", str);
  }

  protected toCodesFrom(key: string, str: string) {
    const codes: number[] = [];
    for (let i = 0; i < this.codes.length; i++) {
      const c = this.codes[i];
      const member = c[key];
      const type = typeof member;
      let code: number = null;
      if (type === "function") {
        code = member(str);
      } else if (type === "object" && member.test(str)) { // RegExp
        code = c.code;
      } else if (member === str) {
        code = c.code;
      }
      if (code !== null) {
        codes.push(code);
      }
    }
    return codes;
  }

  public toNaiyou(code: number) {
    return this.toStr(code, this.toNaiyouStr);
  }

  protected toNaiyouStr(c: Code) {
    if (typeof c.naiyou === "function") {
      return c.naiyou(c.code);
    } else {
      return c.naiyou;
    }
  }

  public toTanshuku(code: number) {
    return this.toStr(code, this.toTanshukuStr);
  }

  protected toTanshukuStr(c: Code) {
    if (!c.tanshuku) {
      return this.toNaiyouStr(c);
    }
    if (typeof c.tanshuku === "function") {
      return c.tanshuku(c.code);
    } else {
      return c.tanshuku;
    }
  }

  protected toStr(code: number, convert: (c: Code) => string) {
    for (let i = 0; i < this.codes.length; i++) {
      const c = this.codes[i];
      if (c.code === code) {
        return convert(c);
      }
    }
    return "";
  }
}
