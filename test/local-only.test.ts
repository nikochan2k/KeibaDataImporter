import { describe, expect, test } from "bun:test";
import { ForbiddenError } from "../src/app/http/errors";
import { assertLocal } from "../src/app/http/localOnly";

function check(remoteAddress: string, host: string | undefined) {
  assertLocal(remoteAddress, host);
  return true;
}

describe("assertLocal", () => {
  test("ローカルからの接続は通す", () => {
    expect(check("127.0.0.1", "localhost:3000")).toBe(true);
    expect(check("127.0.0.1", "127.0.0.1:3000")).toBe(true);
    expect(check("::1", "localhost")).toBe(true);
    expect(check("::ffff:127.0.0.1", "LOCALHOST:3000")).toBe(true);
  });

  test("ローカル以外の接続元は拒否する", () => {
    expect(() => check("192.168.1.10", "localhost:3000")).toThrow(ForbiddenError);
    expect(() => check("", "localhost:3000")).toThrow(ForbiddenError);
  });

  test("Host ヘッダがローカルでなければ拒否する", () => {
    expect(() => check("127.0.0.1", "example.com")).toThrow(ForbiddenError);
    expect(() => check("127.0.0.1", "localhost.evil.com:3000")).toThrow(ForbiddenError);
    expect(() => check("127.0.0.1", undefined)).toThrow(ForbiddenError);
  });
});
