import "reflect-metadata";
import { describe, expect, test } from "bun:test";
import { type ExecutionContext, ForbiddenException } from "@nestjs/common";
import { LocalOnlyGuard } from "../src/app/api/LocalOnlyGuard";

function check(remoteAddress: string, host: string | undefined) {
  const request = { socket: { remoteAddress }, headers: { host } };
  const context = { switchToHttp: () => ({ getRequest: () => request }) } as ExecutionContext;
  return new LocalOnlyGuard().canActivate(context);
}

describe("LocalOnlyGuard", () => {
  test("ローカルからの接続は通す", () => {
    expect(check("127.0.0.1", "localhost:3000")).toBe(true);
    expect(check("127.0.0.1", "127.0.0.1:3000")).toBe(true);
    expect(check("::1", "localhost")).toBe(true);
    expect(check("::ffff:127.0.0.1", "LOCALHOST:3000")).toBe(true);
  });

  test("ローカル以外の接続元は拒否する", () => {
    expect(() => check("192.168.1.10", "localhost:3000")).toThrow(ForbiddenException);
    expect(() => check("", "localhost:3000")).toThrow(ForbiddenException);
  });

  test("Host ヘッダがローカルでなければ拒否する", () => {
    expect(() => check("127.0.0.1", "example.com")).toThrow(ForbiddenException);
    expect(() => check("127.0.0.1", "localhost.evil.com:3000")).toThrow(ForbiddenException);
    expect(() => check("127.0.0.1", undefined)).toThrow(ForbiddenException);
  });
});
