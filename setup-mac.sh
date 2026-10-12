#!/usr/bin/env bash
# KeibaDataImporter を macOS で使えるようにする。
# clone 済みで git が入っている前提。リポジトリのどこから実行してもよい。
#
#   ./setup-mac.sh
#
# 入れるもの: nvm + Node.js (LTS)、Bun、Claude Code (claude)、RTK (rtk)、依存パッケージ

set -euo pipefail

NVM_VERSION="${NVM_VERSION:-v0.40.3}"

info() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
die() { printf '\033[1;31mエラー:\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(uname -s)" = "Darwin" ] || die "macOS 専用のスクリプト"

cd "$(dirname "$0")"

ZSHRC="$HOME/.zshrc"
touch "$ZSHRC"

# ~/.zshrc に <パターン> (grep -E) に合う行が無ければ、<行> を足す。
# インストーラーが別の書き方で同じ設定を書いていることがあるので、行の一致ではなく設定の有無で見る。
zshrc_add() {
  local pattern="$1"
  shift
  grep -qE -- "$pattern" "$ZSHRC" || printf '%s\n' "$@" >>"$ZSHRC"
}

# <dir> を PATH に足す。第2引数は「設定済み」と見なす行のパターン (既定は dir 自体)。~/.zshrc に書き、いまのシェルにも反映する。
# 反映は ~/.zshrc を source せず export で行う (bash から zsh の設定は読めないため)。
add_path() {
  local dir="$1" short="${1/#$HOME/\$HOME}" pattern="${2:-}"
  [ -n "$pattern" ] || pattern="PATH=.*($(printf '%s' "$dir" | sed 's/[.[\*^$]/\\&/g')|$(printf '%s' "$short" | sed 's/[.[\*^$]/\\&/g'))"
  zshrc_add "$pattern" "export PATH=\"$short:\$PATH\""
  case ":$PATH:" in *":$dir:"*) ;; *) export PATH="$dir:$PATH" ;; esac
}

# --- 1. nvm + Node.js (LTS) -----------------------------------------------
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  info "nvm $NVM_VERSION を入れる"
  curl -fsSL "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh" | bash
fi
zshrc_add 'NVM_DIR' \
  'export NVM_DIR="$HOME/.nvm"' \
  '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"' \
  '[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"'
# nvm.sh は未定義変数や非ゼロ終了を使うので、読み込む間だけ厳格モードを外す。
set +eu
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
set -eu
info "Node.js (LTS) を入れる"
nvm install --lts
nvm alias default 'lts/*' >/dev/null
nvm use --lts >/dev/null
info "Node $(node --version) / npm $(npm --version)"

# --- 2. Bun -----------------------------------------------------------------
export PATH="$HOME/.bun/bin:$PATH"
if ! command -v bun >/dev/null 2>&1; then
  info "Bun を入れる"
  if command -v brew >/dev/null 2>&1; then
    brew install oven-sh/bun/bun
  else
    curl -fsSL https://bun.sh/install | bash
  fi
fi
add_path "$HOME/.bun/bin" 'PATH=.*(BUN_INSTALL|\.bun/bin)'
zshrc_add 'BUN_INSTALL' 'export BUN_INSTALL="$HOME/.bun"'
command -v bun >/dev/null 2>&1 || die "bun が見つからない"
info "Bun $(bun --version)"

# --- 3. Claude Code ---------------------------------------------------------
export PATH="$HOME/.local/bin:$PATH"
if ! command -v claude >/dev/null 2>&1; then
  info "Claude Code を入れる"
  curl -fsSL https://claude.ai/install.sh | bash
fi
add_path "$HOME/.local/bin"
command -v claude >/dev/null 2>&1 || die "claude が見つからない"
info "claude $(claude --version 2>/dev/null || echo '(バージョン取得失敗)')"

# --- 4. RTK -----------------------------------------------------------------
# crates.io の別物 "rtk" (Rust Type Kit) と取り違えないよう、公式の配布元から入れる。
if ! command -v rtk >/dev/null 2>&1; then
  info "RTK を入れる"
  if command -v brew >/dev/null 2>&1; then
    brew install rtk
  else
    curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
  fi
fi
add_path "$HOME/.local/bin"
command -v rtk >/dev/null 2>&1 || die "rtk が見つからない"
rtk --version
rtk gain >/dev/null 2>&1 || die "rtk gain が失敗した。別物の rtk かもしれない: https://github.com/rtk-ai/rtk"

# Claude Code にフックと RTK.md を入れる (~/.claude/ に書く)。
info "RTK を Claude Code に組み込む (rtk init -g)"
rtk init -g --auto-patch

# --- 5. 依存パッケージ・ビルド --------------------------------------------------
info "依存パッケージを入れる"
bun install

# db/ はデータベース、tmp/ は比較用の作業場所 (どちらも .gitignore 済み)。
mkdir -p db tmp

info "画面をビルドする"
bun run build

info "型チェック"
bun run typecheck

cat <<EOF

セットアップ完了: $PWD

新しいターミナルを開く (または source ~/.zshrc) と nvm・bun・claude・rtk が使える。

  データを取り込む:      bun start <ディレクトリ>
  サーバーを起動する:    bun run serve     (http://127.0.0.1:3000)
  画面を開発する:        bun run dev
  テスト:                bun test
  Claude Code:           claude   (初回はログインが必要)

データベースは db/keiba.sqlite に作られる (KEIBA_DB で変更可)。
テーブル定義を変えたら、データベースを消して取り込み直す。
EOF
