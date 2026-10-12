# KeibaDataImporter を Windows で使えるようにする。
# clone 済みで git が入っている前提。管理者権限の PowerShell で実行する (nvm-windows がシンボリックリンクを作るため)。
#
#   .\setup-windows.bat        (または powershell -ExecutionPolicy Bypass -File .\setup-windows.ps1)
#
# 入れるもの: nvm-windows + Node.js (LTS)、Bun、Claude Code (claude)、RTK (rtk)、依存パッケージ

$ErrorActionPreference = 'Stop'

function Info($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }
function Die($msg) { Write-Host "エラー: $msg" -ForegroundColor Red; exit 1 }

# 外部コマンドを実行し、終了コードが 0 以外なら止める。
function Run {
  param([string]$Exe, [string[]]$Arguments)
  & $Exe @Arguments
  if ($LASTEXITCODE -ne 0) { Die "$Exe $($Arguments -join ' ') が失敗した (終了コード $LASTEXITCODE)" }
}

function Has($name) { [bool](Get-Command $name -ErrorAction SilentlyContinue) }

# インストーラーが更新したユーザー・マシンの PATH を、いまのセッションに取り込む。
function Update-SessionPath {
  $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $user = [Environment]::GetEnvironmentVariable('Path', 'User')
  $env:Path = "$machine;$user"
}

function Test-InPath([string]$list, [string]$dir) {
  $want = $dir.TrimEnd('\')
  foreach ($p in $list -split ';') {
    if ($p.TrimEnd('\') -ieq $want) { return $true }
  }
  return $false
}

# <dir> をユーザーの PATH (永続) といまのセッションに足す。すでにあれば何もしない。
function Add-Path([string]$dir) {
  $user = [Environment]::GetEnvironmentVariable('Path', 'User')
  if (-not (Test-InPath $user $dir)) {
    $new = if ([string]::IsNullOrEmpty($user)) { $dir } else { "$user;$dir" }
    [Environment]::SetEnvironmentVariable('Path', $new, 'User')
  }
  if (-not (Test-InPath $env:Path $dir)) { $env:Path = "$dir;$env:Path" }
}

function Install-Winget([string]$id) {
  Run winget @('install', '--id', $id, '-e', '--accept-package-agreements', '--accept-source-agreements')
  Update-SessionPath
}

if (-not (Has winget)) { Die 'winget が見つからない。Microsoft Store の「アプリ インストーラー」を入れる' }

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
  ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) { Write-Host '警告: 管理者権限ではない。nvm use が失敗したら管理者で実行し直す' -ForegroundColor Yellow }

Set-Location $PSScriptRoot
$localBin = Join-Path $env:USERPROFILE '.local\bin'

# --- 1. nvm-windows + Node.js (LTS) ----------------------------------------
if (-not (Has nvm)) {
  Info 'nvm-windows を入れる'
  Install-Winget 'CoreyButler.NVMforWindows'
  # インストーラーが設定した環境変数をセッションに取り込む。
  foreach ($n in 'NVM_HOME', 'NVM_SYMLINK') {
    $v = [Environment]::GetEnvironmentVariable($n, 'Machine')
    if (-not $v) { $v = [Environment]::GetEnvironmentVariable($n, 'User') }
    if ($v) { Set-Item "Env:$n" $v }
  }
}
if (-not (Has nvm)) { Die 'nvm が見つからない。新しいターミナルで再実行する' }
Info 'Node.js (LTS) を入れる'
Run nvm @('install', 'lts')
Run nvm @('use', 'lts')
Update-SessionPath
if (-not (Has node)) { Die 'node が見つからない。管理者権限か開発者モードが必要' }
Info "Node $(node --version) / npm $(npm --version)"

# --- 2. Bun -----------------------------------------------------------------
if (-not (Has bun)) {
  Info 'Bun を入れる'
  Install-Winget 'Oven-sh.Bun'
}
if (-not (Has bun)) { Add-Path (Join-Path $env:USERPROFILE '.bun\bin') }
if (-not (Has bun)) { Die 'bun が見つからない' }
Info "Bun $(bun --version)"

# --- 3. Claude Code ---------------------------------------------------------
if (-not (Has claude)) {
  Info 'Claude Code を入れる'
  Invoke-RestMethod https://claude.ai/install.ps1 | Invoke-Expression
}
if (Test-Path $localBin) { Add-Path $localBin }
if (-not (Has claude)) { Die 'claude が見つからない' }
Info "claude $(claude --version)"

# --- 4. RTK -----------------------------------------------------------------
# crates.io の別物 "rtk" (Rust Type Kit) と取り違えないよう、公式のリリースから入れる。
if (-not (Has rtk)) {
  Info 'RTK を入れる'
  $release = Invoke-RestMethod 'https://api.github.com/repos/rtk-ai/rtk/releases/latest'
  $asset = $release.assets | Where-Object { $_.name -match 'windows.*\.zip$' } | Select-Object -First 1
  if (-not $asset) { Die 'RTK の Windows 用リリースが見つからない: https://github.com/rtk-ai/rtk' }
  $tmp = Join-Path ([IO.Path]::GetTempPath()) "rtk-$([guid]::NewGuid())"
  New-Item -ItemType Directory -Path $tmp | Out-Null
  try {
    $zip = Join-Path $tmp $asset.name
    Invoke-WebRequest $asset.browser_download_url -OutFile $zip
    Expand-Archive $zip -DestinationPath $tmp
    $exe = Get-ChildItem $tmp -Recurse -Filter rtk.exe | Select-Object -First 1
    if (-not $exe) { Die 'アーカイブに rtk.exe が無い' }
    New-Item -ItemType Directory -Force -Path $localBin | Out-Null
    Copy-Item $exe.FullName (Join-Path $localBin 'rtk.exe') -Force
  } finally {
    Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
  }
}
Add-Path $localBin
if (-not (Has rtk)) { Die 'rtk が見つからない' }
Run rtk @('--version')
& rtk gain *> $null
if ($LASTEXITCODE -ne 0) { Die 'rtk gain が失敗した。別物の rtk かもしれない: https://github.com/rtk-ai/rtk' }

# Claude Code に RTK を組み込む (~/.claude/ に書く)。Windows ではフック非対応のことがあるので、失敗しても続ける。
Info 'RTK を Claude Code に組み込む (rtk init -g)'
& rtk init -g --auto-patch
if ($LASTEXITCODE -ne 0) { Write-Host '警告: rtk init -g が失敗した。あとで手動で実行する' -ForegroundColor Yellow }

# --- 5. 依存パッケージ・ビルド --------------------------------------------------
Info '依存パッケージを入れる'
Run bun @('install')

# db/ はデータベース、tmp/ は比較用の作業場所 (どちらも .gitignore 済み)。
New-Item -ItemType Directory -Force -Path db, tmp | Out-Null

Info '画面をビルドする'
Run bun @('run', 'build')

Info '型チェック'
Run bun @('run', 'typecheck')

Write-Host @"

セットアップ完了: $PWD

新しいターミナルを開くと nvm・bun・claude・rtk が使える。

  データを取り込む:      bun start <ディレクトリ>
  サーバーを起動する:    bun run serve     (http://127.0.0.1:3000)
  画面を開発する:        bun run dev
  テスト:                bun test
  Claude Code:           claude   (初回はログインが必要)

データベースは db\keiba.sqlite に作られる (KEIBA_DB で変更可)。
テーブル定義を変えたら、データベースを消して取り込み直す。
"@
