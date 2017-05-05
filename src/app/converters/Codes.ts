interface Code {
  code?: number;
  kol?: string | string[] | ((str: string) => number);
  jrdb?: string | string[] | ((str: string) => number);
  jravan?: string | string[] | ((str: string) => number);
  naiyou?: string | ((code: number) => string);
  tanshuku?: string | ((code: number) => string);
}

export class Codes {
  private codes: Code[];

  constructor(codes: Code[]) {
    this.codes = codes;
  }

  public toCodeFromKol(str: string) {
    return this.toCodeFrom("kol", str);
  }

  public toCodeFromJrdb(str: string) {
    return this.toCodeFrom("jrdb", str);
  }

  public toCodeFromJravan(str: string) {
    return this.toCodeFrom("jravan", str);
  }

  protected toCodeFrom(key: string, str: string) {
    for (let i = 0; i < this.codes.length; i++) {
      const c = this.codes[i];
      const member = c[key];
      if (typeof member === "function") {
        return member(str);
      } else if (Array.isArray(member)) {
        const vals = <String[]>member;
        for (let j = 0; j < vals.length; j++) {
          const val = vals[j];
          if (val === str) {
            return c.code;
          }
        }
      } else if (member === str) {
        return c.code;
      }
    }
    return null;
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
