/** 走破タイム(秒)を 1:36.2 の形にする */
export function formatTime(seconds: number | null | undefined) {
  if (seconds == null) {
    return "";
  }
  const minutes = Math.floor(seconds / 60);
  const rest = (seconds - minutes * 60).toFixed(1).padStart(4, "0");
  return `${minutes}:${rest}`;
}

export function formatChakujun(chakujun: number | null, torikeshi: number | null = null) {
  if (chakujun != null) {
    return String(chakujun);
  }
  return torikeshi ? "取消" : "";
}

export function formatZougen(zougen: number | null) {
  if (zougen == null) {
    return "";
  }
  return zougen > 0 ? `+${zougen}` : String(zougen);
}

export function formatDateTime(iso: string | undefined) {
  return iso ? new Date(iso).toLocaleString("ja-JP") : "";
}

/** 今日の日付 (YYYY-MM-DD)。ブラウザのローカル時刻 */
export function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
