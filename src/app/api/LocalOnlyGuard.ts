import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type { Request } from "express";

const LOOPBACK_ADDRESSES = ["127.0.0.1", "::1", "::ffff:127.0.0.1"];
const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1"];

/**
 * 同じマシンからの接続だけを通す。取り込みはファイルシステムを読むので、外には出さない。
 * 接続元のアドレスに加えて、Host ヘッダも見る (DNS rebinding でブラウザ経由の攻撃を受けないように)。
 */
@Injectable()
export class LocalOnlyGuard implements CanActivate {
  public canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const remote = request.socket?.remoteAddress ?? "";
    const hostname = (request.headers?.host ?? "").replace(/:\d+$/, "").toLowerCase();
    if (!LOOPBACK_ADDRESSES.includes(remote) || !LOCAL_HOSTNAMES.includes(hostname)) {
      throw new ForbiddenException("取り込みはローカルからしか使えません");
    }
    return true;
  }
}
