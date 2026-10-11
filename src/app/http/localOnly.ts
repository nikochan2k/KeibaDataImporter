import { ForbiddenError } from "./errors";

const LOOPBACK_ADDRESSES = ["127.0.0.1", "::1", "::ffff:127.0.0.1"];
const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1"];

/**
 * 同じマシンからの接続だけを通す。取り込みはファイルシステムを読むので、外には出さない。
 * 接続元のアドレスに加えて、Host ヘッダも見る (DNS rebinding でブラウザ経由の攻撃を受けないように)。
 */
export function assertLocal(remoteAddress: string | undefined, host: string | undefined) {
  const hostname = (host ?? "").replace(/:\d+$/, "").toLowerCase();
  if (!LOOPBACK_ADDRESSES.includes(remoteAddress ?? "") || !LOCAL_HOSTNAMES.includes(hostname)) {
    throw new ForbiddenError("取り込みはローカルからしか使えません");
  }
}
