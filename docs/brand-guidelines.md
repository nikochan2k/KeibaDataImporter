# Brand Guidelines v1.0

> Last updated: 2026-10-11
> Status: Draft

JRA-VAN・JRDB のデータを取り込み、レースと馬を閲覧する個人用ツール「Keiba」のガイドライン。
現行の `web/src/styles.css` の値を正とし、それを文書化したもの。

## Quick Reference

| Element | Value |
|---------|-------|
| Primary Color | #0B6E4F |
| Secondary Color | #4CC38A |
| Primary Font | system-ui |
| Voice | 簡潔、事実本位、落ち着いている |

---

## 1. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Turf Green | #0B6E4F | rgb(11,110,79) | リンク、選択中のナビ、送信ボタン、選択中のチップ (ライト) |
| Turf Green Light | #4CC38A | rgb(76,195,138) | 同上 (ダーク) |

### Neutral Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Background | #FAFAFA | rgb(250,250,250) | ページ背景 (ライト) |
| Surface | #FFFFFF | rgb(255,255,255) | 表、ヘッダー、入力欄 (ライト) |
| Text Primary | #1C1C1E | rgb(28,28,30) | 本文、見出し (ライト) |
| Text Secondary | #6B6B70 | rgb(107,107,112) | 補足、表の見出し (ライト) |
| Border | #DCDCE0 | rgb(220,220,224) | 罫線、枠 (ライト) |
| Background Dark | #17181A | rgb(23,24,26) | ページ背景 (ダーク) |
| Surface Dark | #1F2023 | rgb(31,32,35) | 表、ヘッダー (ダーク) |
| Text Primary Dark | #ECECEE | rgb(236,236,238) | 本文 (ダーク) |
| Text Secondary Dark | #9A9AA2 | rgb(154,154,162) | 補足 (ダーク) |
| Border Dark | #34353A | rgb(52,53,58) | 罫線 (ダーク) |

### Semantic Colors

| State | Hex | Usage |
|-------|-----|-------|
| Error | #B3261E | エラー表示 (ライト) |
| Error Dark | #FF8A80 | エラー表示 (ダーク) |

### Accessibility

- 本文はライト・ダークとも背景に対して 4.5:1 以上を保つ。
- 状態は色だけで伝えず、文言も添える。

---

## 2. Typography

### Font Stack

```css
--font-body: system-ui, "Hiragino Sans", "Yu Gothic UI", sans-serif;
```

数値の列は `font-variant-numeric: tabular-nums` で桁を揃える。

### Type Scale

| Element | Size (Desktop) | Size (Mobile) | Weight | Line Height |
|---------|----------------|---------------|--------|-------------|
| H1 | 22px | 22px | 700 | 1.6 |
| H2 | 17px | 17px | 700 | 1.6 |
| Body | 15px | 15px | 400 | 1.6 |
| Small | 13px | 13px | 600 | 1.6 |

---

## 3. Logo Usage

ロゴは持たない。ヘッダー左に太字の文字列「Keiba」を置く。

### Don'ts

- アクセント色を #0B6E4F / #4CC38A 以外に変えない
- 文字列に影や装飾を付けない

---

## 4. Voice & Tone

### Brand Personality

| Trait | Description |
|-------|-------------|
| **簡潔** | 必要なことだけを書く |
| **事実本位** | 状況をそのまま伝える。推測や誇張をしない |
| **落ち着き** | エラーでも慌てさせない |

### Tone by Context

| Context | Tone | Example |
|---------|------|---------|
| 通常の画面 | 体言止めか、です・ます調 | 「取り込みの状況を見る」 |
| 待機 | 理由と、いつ終わるかを書く | 「取り込みが終わるまで、レースと馬は見られません。」 |
| エラー | 何が起きたかと、次の手を書く | 「ページが見つかりません」 |

---

## 5. Design Components

### Buttons

| Type | Background | Text | Border Radius |
|------|------------|------|---------------|
| Primary (submit) | Turf Green | #FFFFFF (ダークは #0D1F17) | 6px |
| Default | Surface | Text Primary | 6px |

### Chips

選択中は Turf Green 地に白文字、未選択は Surface 地に枠線。

### Tables

Surface 地、1px の Border 罫線、見出しは Text Secondary の 13px。数値は右寄せ。
