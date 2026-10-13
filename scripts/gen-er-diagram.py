#!/usr/bin/env python3
"""docs/er-diagram.html を生成する。

使い方: python3 scripts/gen-er-diagram.py [出力先]   (既定は docs/er-diagram.html)

載せる列は src/app/entities から手で選んで下の E に書いてある。
エンティティを足したり列を変えたら、E と build() を直して再生成する。
"""
import html
import math
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

W, GAP, X0, ROW = 232, 96, 32, 56  # box width, column gap, left margin, vertical gap
INK, MUTED, ACCENT, PAPER = "#2d3142", "#4f5d75", "#bf4520", "#f5f5f5"
MONO = "'Geist Mono', ui-monospace, monospace"
SANS = "'Geist', 'Noto Sans JP', 'Hiragino Sans', sans-serif"
JP = "'Noto Sans JP', 'Hiragino Sans', 'Geist', sans-serif"

# name: (日本語名, 列の総数, [フィールド])。'#' 主キー、'→' 外部キー。
E = {
    "Kaisai": ("開催", 13, ["# Id", "Key", "Basho", "Nen / Gatsu / Nichi", "Kaiji / Nichiji"]),
    "KaisaiYosou": ("開催予想", 25, ["# Id", "Tenki", "ShibaBaba", "DirtBaba"]),
    "Race": ("レース", 82, ["# Id", "→ KaisaiId", "RaceBangou", "Grade", "Kyori", "DirtShiba", "Tousuu", "HassouJikan",
                           "→ CourseRecordId", "→ KyoriRecordId", "→ RaceRecordId", "Shoukin1Chaku", "BakenHatsubaiFlag*",
                           "SuiteiTimeRyou"]),
    "RaceSeiseki": ("レース成績", 20, ["# Id", "Pace", "Tenki", "Baba", "Shoukin1Chaku"]),
    "RaceMei": ("レース名", 3, ["# Id", "→ RaceId", "→ TokubetsuMeiId"]),
    "TokubetsuMei": ("特別競走名", 2, ["# Id", "Meishou"]),
    "Record": ("レコード", 16, ["# Id", "Shubetsu", "Nengappi", "Time", "→ RaceId", "Basho", "Kyori"]),
    "RecordHoyuuba": ("レコード保有馬", 6, ["# → RecordId", "# → UmaId", "→ KishuId", "→ TanshukuKishuMeiId",
                                       "→ ChoukyoushiId"]),
    "RaceKeika": ("レース経過", 5, ["# Id", "→ RaceId", "Keika"]),
    "RaceLapTime": ("ラップタイム", 5, ["# Id", "→ RaceId", "LapTime"]),
    "RaceHyousuu": ("票数", 6, ["# Id", "→ RaceId", "Baken"]),
    "RaceTrackBias": ("トラックバイアス", 5, ["# Id", "→ RaceId", "TrackBias"]),
    "RaceHassouJoukyou": ("発走状況", 7, ["# Id", "→ RaceId", "HassouJoukyou"]),
    "OddsHaitou": ("オッズ・配当", 13, ["# Id", "→ RaceId", "Baken"]),
    "Shussouba": ("出走馬", 20, ["# Id", "→ RaceId", "Wakuban", "Umaban", "→ KyousoubaId", "Nenrei", "Kinryou",
                                "→ KishuId", "→ KishuShozokuChoukyoushiId", "KishuTouzaiBetsu", "KishuShozokuBasho",
                                "MinaraiKubun", "Norikawari", "Blinker", "TorikeshiShubetsu"]),
    "ShussoubaSeiseki": ("出走馬成績", 35, ["# Id", "→ KishuId", "Time"]),
    "ShussoubaYosou": ("出走馬予想", 137, ["# Id", "→ HoubokusakiId", "Idm"]),
    "ShussoubaHyouka": ("出走馬評価", 54, ["# Id", "Idm", "IdmSoten"]),
    "ShussoubaJoutai": ("出走馬状態", 4, ["# Id", "→ ShussoubaId", "Kubun / Code"]),
    "ShussoubaTsuukaJuni": ("通過順", 5, ["# Id", "→ ShussoubaId", "Juni"]),
    "Kyousouba": ("競走馬", 6, ["# Id", "→ UmaId", "Seibetsu", "→ ChoukyoushiId"]),
    "Houbokusaki": ("放牧先", 3, ["# Id", "Meishou", "MatchingKey"]),
    "ShussoubaKeika": ("出走馬経過", 8, ["# Id", "→ RaceKeikaId", "→ ShussoubaId", "TateCount"]),
    "ShussoubaHassouJoukyou": ("出走馬発走状況", 3, ["# Id", "→ RaceHassouJoukyouId", "→ ShussoubaId"]),
    "ShussoubaChoukyou": ("出走馬調教", 7, ["# Id", "→ ShussoubaId", "→ ChoukyouId", "HonOikiri"]),
    "Choukyou": ("調教", 35, ["# Id", "→ UmaId", "→ TanshukuKishuMeiId", "→ AwaseUmaId", "Nengappi", "Basho"]),
    "ChoukyouTime": ("調教タイム", 4, ["# → ChoukyouId", "# F", "Time", "Comment"]),
    "Uma": ("馬", 32, ["# Id", "KolUmaCode", "KettouTourokuBangou", "KanaBamei", "→ ChichiUmaId", "→ HahaUmaId",
                      "→ KeitouId", "SanchiCode", "JvDataSeisanshaCode", "EigoBamei"]),
    "Keitou": ("系統", 3, ["# Id", "Meishou", "Setsumei"]),
    "Hanshokuba": ("繁殖馬", 2, ["# HanshokuTourokuBangou", "→ UmaId"]),
    "ShijouTorihiki": ("市場取引", 6, ["# → UmaId", "# → ShijouCode", "# KaishiNengappi", "Kakaku"]),
    "Shijou": ("市場", 3, ["# Code", "ShusaishaMei", "Meishou"]),
    "Choukyoushi": ("調教師", 14, ["# Id", "KolKyuushaCode", "JrdbChoukyoushiCode", "JvDataChoukyoushiCode",
                                  "Seinengappi"]),
    "Kishu": ("騎手", 13, ["# Id", "KolKishuCode", "JrdbKishuCode", "JvDataKishuCode", "→ ShozokuChoukyoushiId"]),
    "KishuMei": ("騎手名", 4, ["# Id", "→ KishuId", "→ JinmeiId", "Kubun"]),
    "ChoukyoushiMei": ("調教師名", 4, ["# Id", "→ ChoukyoushiId", "→ JinmeiId", "Kubun"]),
    "Jinmei": ("人名", 3, ["# Id", "Meishou", "MatchingKey"]),
    "UmaBanushi": ("馬の馬主", 3, ["# → UmaId", "# Nengappi", "→ BanushiId"]),
    "Banushi": ("馬主", 4, ["# Id", "JvDataCode", "BanushiKaiCode"]),
    "BanushiMei": ("馬主名", 4, ["# Id", "→ BanushiId", "→ ShoyuuId", "Kubun"]),
    "Shoyuu": ("所有者名", 3, ["# Id", "Meishou", "MatchingKey"]),
    "Seisansha": ("生産者", 3, ["# Id", "JvDataCode", "Juusho"]),
    "SeisanshaMei": ("生産者名", 4, ["# Id", "→ SeisanshaId", "→ ShoyuuId", "Kubun"]),
    "Seisanba": ("生産馬", 3, ["# Id", "→ UmaId", "→ SeisanshaId"]),
    "Chakudosuu": ("着度数", 12, ["# Taishou", "# TaishouId", "# Nengappi", "# Kikan", "# Bunrui", "Chaku1"]),
    "ChakudosuuShuukei": ("着度数集計", 24, ["# Taishou", "# TaishouId", "# Nengappi", "# Kikan", "HeichiHonShoukin"]),
    "ShussoubaJoukenChakudosuu": ("出走馬条件別着度数", 6, ["# → ShussoubaId", "# Jouken", "Chaku1 / 2 / 3"]),
    "Win5": ("重勝式", 8, ["# Nengappi", "Kubun", "HatsubaiHyousuu", "HenkanFlag"]),
    "Win5Race": ("重勝式対象レース", 4, ["# Nengappi", "# Jun", "→ RaceId", "YuukouHyousuu"]),
    "Win5Haraimodoshi": ("重勝式払戻", 8, ["# Nengappi", "# Umaban1 .. 5", "Haraimodoshikin", "TekichuuHyousuu"]),
    "TokubetsuTourokuba": ("特別登録馬", 6, ["# → RaceId", "# → UmaId", "Renban", "→ KyousoubaId", "Kinryou"]),
    "TouhyouJogaiba": ("投票除外馬", 5, ["# → RaceId", "# → UmaId", "# UketsukeJun", "JogaiJoutai"]),
    "Taishou": ("着度数の対象", 0, ["Uma  (馬・種牡馬)", "Kishu", "Choukyoushi", "Banushi", "Seisansha"]),
}


def esc(s):
    return html.escape(s, quote=False)


def box_h(name, nlines=None):
    ja, total, fields = E[name]
    n = nlines if nlines is not None else len(fields)
    has_more = total - len(fields) > 0 and name != "Taishou"
    return 60 + 20 * (n + (1 if has_more else 0))


class Dia:
    def __init__(self, slug, ncols, title, desc, top=48):
        self.slug, self.ncols, self.title, self.desc = slug, ncols, title, desc
        self.top = top
        self.boxes = {}   # name -> dict(x, y, h, style, fields)
        self.conns = []
        self.styles = set()
        self.bottom = top

    def X(self, col):
        return X0 + col * (W + GAP)

    def add(self, name, col, y, style="entity", nfields=None, fields=None, shown_total=None):
        ja, total, flds = E[name]
        flds = fields if fields is not None else flds
        if nfields is not None:
            flds = flds[:nfields]
        more = 0 if name == "Taishou" else max(0, total - len(flds))
        if shown_total is not None:
            more = shown_total
        h = 60 + 20 * (len(flds) + (1 if more else 0))
        self.boxes[name] = dict(x=self.X(col), y=y, h=h, style=style, fields=flds, more=more, col=col)
        self.styles.add(style)
        self.bottom = max(self.bottom, y + h)
        return self.boxes[name]

    def b(self, n):
        return self.boxes[n]

    def below(self, name, gap=ROW):
        b = self.boxes[name]
        return b["y"] + b["h"] + gap

    # ---- connectors
    def hconn(self, a, b, y, c1, c2, label=None, dash=False):
        A, B = self.boxes[a], self.boxes[b]
        for X in (A, B):
            assert X["y"] + 44 <= y <= X["y"] + X["h"] - 8, (self.slug, a, b, y, X["y"], X["h"])
        if A["x"] < B["x"]:
            pts = [(A["x"] + W, y), (B["x"], y)]
        else:
            pts = [(A["x"], y), (B["x"] + W, y)]
        self.conns.append(dict(pts=pts, c1=c1, c2=c2, label=label, dash=dash))

    def vconn(self, a, b, xoff, c1, c2, label=None, dash=False):
        A, B = self.boxes[a], self.boxes[b]
        x = A["x"] + xoff
        if A["y"] < B["y"]:
            pts = [(x, A["y"] + A["h"]), (x, B["y"])]
        else:
            pts = [(x, A["y"]), (x, B["y"] + B["h"])]
        self.conns.append(dict(pts=pts, c1=c1, c2=c2, label=label, dash=dash))

    def poly(self, pts, c1, c2, label=None, dash=False, lseg=None):
        self.conns.append(dict(pts=pts, c1=c1, c2=c2, label=label, dash=dash, lseg=lseg))

    def elbow_h(self, a, ya, b, yb, c1, c2, label=None, dash=False, mx=None):
        """a の端から b の端へ H-V-H。a と b は隣り合う列。"""
        A, B = self.boxes[a], self.boxes[b]
        for X, yy in ((A, ya), (B, yb)):
            assert X["y"] + 44 <= yy <= X["y"] + X["h"] - 8, (self.slug, a, b, yy, X["y"], X["h"])
        if A["x"] < B["x"]:
            xs, xe = A["x"] + W, B["x"]
        else:
            xs, xe = A["x"], B["x"] + W
        if mx is None:
            mx = (xs + xe) / 2
        self.conns.append(dict(pts=[(xs, ya), (mx, ya), (mx, yb), (xe, yb)], c1=c1, c2=c2, label=label, dash=dash,
                               lseg=3))

    # ---- rendering
    def render(self):
        width = 2 * X0 + self.ncols * W + (self.ncols - 1) * GAP
        out = []
        o = out.append
        legend_y = self.bottom + 44
        height = legend_y + 64
        s = self.slug
        o(f'<svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" role="img" '
          f'aria-labelledby="{s}-title {s}-desc" style="min-width:{width}px">')
        o(f'<title id="{s}-title">{esc(self.title)}</title>')
        o(f'<desc id="{s}-desc">{esc(self.desc)}</desc>')
        o(f'<defs><pattern id="{s}-dots" width="24" height="24" patternUnits="userSpaceOnUse">'
          f'<circle cx="1" cy="1" r="0.9" fill="rgba(45,49,66,0.10)"/></pattern></defs>')
        o(f'<rect width="100%" height="100%" fill="{PAPER}"/>')
        o(f'<rect width="100%" height="100%" fill="url(#{s}-dots)" opacity="0.55"/>')
        for c in self.conns:
            self._conn_line(o, c)
        for c in self.conns:
            self._conn_text(o, c)
        for n, bx in self.boxes.items():
            self._box(o, n, bx)
        self._legend(o, width, legend_y)
        o("</svg>")
        return "\n".join(out)

    def _path(self, pts, r=8):
        d = f"M {pts[0][0]:g},{pts[0][1]:g}"
        for i in range(1, len(pts) - 1):
            p0, p1, p2 = pts[i - 1], pts[i], pts[i + 1]
            def unit(a, b):
                dx, dy = b[0] - a[0], b[1] - a[1]
                l = math.hypot(dx, dy)
                return dx / l, dy / l
            u1, u2 = unit(p0, p1), unit(p1, p2)
            a = (p1[0] - u1[0] * r, p1[1] - u1[1] * r)
            b = (p1[0] + u2[0] * r, p1[1] + u2[1] * r)
            d += f" L {a[0]:g},{a[1]:g} Q {p1[0]:g},{p1[1]:g} {b[0]:g},{b[1]:g}"
        d += f" L {pts[-1][0]:g},{pts[-1][1]:g}"
        return d

    def _conn_line(self, o, c):
        dash = ' stroke-dasharray="5,4"' if c["dash"] else ""
        if len(c["pts"]) == 2:
            (x1, y1), (x2, y2) = c["pts"]
            o(f'<line x1="{x1:g}" y1="{y1:g}" x2="{x2:g}" y2="{y2:g}" stroke="{MUTED}" stroke-width="1"{dash}/>')
        else:
            o(f'<path d="{self._path(c["pts"])}" fill="none" stroke="{MUTED}" stroke-width="1"{dash}/>')

    def _card(self, o, p, d, text, end):
        """p: 端点、d: 線が進む向き (単位ベクトル)。end なら箱へ入る向き。"""
        if end:
            d = d
        x, y = p
        dx, dy = d
        if dy == 0:  # 水平
            if not end:
                tx, anchor = x + dx * 6, ("start" if dx > 0 else "end")
            else:
                tx, anchor = x - dx * 6, ("end" if dx > 0 else "start")
            ty = y - 8
        else:
            tx, anchor = x + 8, "start"
            ty = (y + 14) if (not end and dy > 0) or (end and dy < 0) else (y - 6)
        o(f'<text x="{tx:g}" y="{ty:g}" fill="{MUTED}" font-size="10" font-family="{MONO}" font-weight="600" '
          f'text-anchor="{anchor}">{esc(text)}</text>')

    def _conn_text(self, o, c):
        pts = c["pts"]
        def unit(a, b):
            dx, dy = b[0] - a[0], b[1] - a[1]
            l = math.hypot(dx, dy)
            return (dx / l, dy / l)
        self._card(o, pts[0], unit(pts[0], pts[1]), c["c1"], False)
        self._card(o, pts[-1], unit(pts[-2], pts[-1]), c["c2"], True)
        if not c["label"]:
            return
        i = c.get("lseg")
        if i is None:
            i = max(range(len(pts) - 1), key=lambda k: math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]))
        else:
            i = i - 1 if i >= 1 else 0
        (x1, y1), (x2, y2) = pts[i], pts[i + 1]
        text = c["label"]
        assert len(text) <= 14, text
        tw = len(text) * 5.8
        if y1 == y2:
            seg = abs(x2 - x1)
            assert tw + 8 <= seg - 8, (self.slug, text, seg)
            cx = (x1 + x2) / 2
            o(f'<rect x="{cx - tw / 2 - 4:g}" y="{y1 + 6:g}" width="{tw + 8:g}" height="14" rx="2" fill="{PAPER}"/>')
            o(f'<text x="{cx:g}" y="{y1 + 17:g}" fill="{MUTED}" font-size="8" font-family="{MONO}" '
              f'text-anchor="middle" letter-spacing="0.12em">{esc(text)}</text>')
        else:
            cy = (y1 + y2) / 2
            o(f'<rect x="{x1 + 8:g}" y="{cy - 7:g}" width="{tw + 8:g}" height="14" rx="2" fill="{PAPER}"/>')
            o(f'<text x="{x1 + 12:g}" y="{cy + 3:g}" fill="{MUTED}" font-size="8" font-family="{MONO}" '
              f'letter-spacing="0.12em">{esc(text)}</text>')

    def _box(self, o, name, bx):
        x, y, h, st = bx["x"], bx["y"], bx["h"], bx["style"]
        ja = E[name][0]
        if st == "focal":
            fill, stroke, hdr, rule, tag, tagc, dash = "rgba(191,69,32,0.04)", ACCENT, "rgba(191,69,32,0.10)", \
                "rgba(191,69,32,0.40)", "ENTITY · FOCAL", ACCENT, ""
        elif st == "join":
            fill, stroke, hdr, rule, tag, tagc, dash = "rgba(45,49,66,0.04)", MUTED, "rgba(45,49,66,0.06)", \
                "rgba(45,49,66,0.22)", "JOIN", MUTED, ' stroke-dasharray="4,3"'
        elif st == "ref":
            fill, stroke, hdr, rule, tag, tagc, dash = PAPER, MUTED, "rgba(45,49,66,0.04)", \
                "rgba(45,49,66,0.22)", "REF · 別図", MUTED, ""
        elif st == "poly":
            fill, stroke, hdr, rule, tag, tagc, dash = "#ffffff", INK, "rgba(45,49,66,0.04)", \
                "rgba(45,49,66,0.22)", "POLYMORPHIC", MUTED, ' stroke-dasharray="4,3"'
        else:
            fill, stroke, hdr, rule, tag, tagc, dash = "#ffffff", INK, "rgba(45,49,66,0.04)", \
                "rgba(45,49,66,0.22)", "ENTITY", MUTED, ""
        o(f'<rect x="{x}" y="{y}" width="{W}" height="{h}" rx="6" fill="{fill}" stroke="{stroke}" stroke-width="1"{dash}/>')
        o(f'<rect x="{x}" y="{y}" width="{W}" height="40" rx="6" fill="{hdr}" stroke="none"/>')
        o(f'<rect x="{x}" y="{y + 32}" width="{W}" height="8" fill="{hdr}"/>')
        o(f'<line x1="{x}" y1="{y + 40}" x2="{x + W}" y2="{y + 40}" stroke="{rule}" stroke-width="1"/>')
        o(f'<text x="{x + 16}" y="{y + 16}" fill="{tagc}" font-size="8" font-family="{MONO}" letter-spacing="0.14em">'
          f'{esc(tag)}</text>')
        o(f'<text x="{x + 16}" y="{y + 32}" fill="{INK}" font-size="14" font-weight="600" font-family="{SANS}">'
          f'{esc(name)}</text>')
        o(f'<text x="{x + W - 16}" y="{y + 32}" fill="{MUTED}" font-size="10" font-family="{JP}" text-anchor="end">'
          f'{esc(ja)}</text>')
        col = MUTED if st == "ref" else INK
        yy = y + 60
        for f in bx["fields"]:
            wgt = ' font-weight="600"' if f.startswith("#") else ""
            o(f'<text x="{x + 16}" y="{yy}" fill="{col}" font-size="10" font-family="{MONO}"{wgt}>{esc(f)}</text>')
            yy += 20
        if bx["more"]:
            o(f'<text x="{x + 16}" y="{yy}" fill="{MUTED}" font-size="10" font-family="{JP}">… 他 {bx["more"]} 列</text>')

    def _legend(self, o, width, y):
        o(f'<line x1="{X0}" y1="{y}" x2="{width - X0}" y2="{y}" stroke="rgba(45,49,66,0.10)" stroke-width="0.8"/>')
        o(f'<text x="{X0}" y="{y + 16}" fill="{MUTED}" font-size="8" font-family="{MONO}" letter-spacing="0.18em">'
          f'LEGEND</text>')
        x = X0
        by = y + 28
        items = []
        if "focal" in self.styles:
            items.append(("focal", "中心のエンティティ"))
        if "entity" in self.styles:
            items.append(("entity", "エンティティ"))
        if "join" in self.styles:
            items.append(("join", "対応表"))
        if "ref" in self.styles:
            items.append(("ref", "別の図の主役"))
        if "poly" in self.styles:
            items.append(("poly", "多態の参照先"))
        for st, text in items:
            fill, stroke, dash = {"focal": ("rgba(191,69,32,0.04)", ACCENT, ""), "entity": ("#ffffff", INK, ""),
                                  "join": ("rgba(45,49,66,0.04)", MUTED, ' stroke-dasharray="3,2"'),
                                  "ref": (PAPER, MUTED, ""), "poly": ("#ffffff", INK, ' stroke-dasharray="3,2"')}[st]
            o(f'<rect x="{x}" y="{by}" width="14" height="10" rx="2" fill="{fill}" stroke="{stroke}" stroke-width="1"{dash}/>')
            o(f'<text x="{x + 20}" y="{by + 8}" fill="{MUTED}" font-size="10" font-family="{JP}">{text}</text>')
            x += 20 + len(text) * 10 + 28
        o(f'<text x="{x}" y="{by + 8}" fill="{INK}" font-size="10" font-family="{MONO}" font-weight="600">#</text>')
        o(f'<text x="{x + 12}" y="{by + 8}" fill="{MUTED}" font-size="10" font-family="{JP}">主キー</text>')
        x += 76
        o(f'<text x="{x}" y="{by + 8}" fill="{INK}" font-size="10" font-family="{MONO}" font-weight="600">→</text>')
        o(f'<text x="{x + 16}" y="{by + 8}" fill="{MUTED}" font-size="10" font-family="{JP}">外部キー</text>')
        x += 92
        o(f'<line x1="{x}" y1="{by + 5}" x2="{x + 28}" y2="{by + 5}" stroke="{MUTED}" stroke-width="1" '
          f'stroke-dasharray="5,4"/>')
        o(f'<text x="{x + 36}" y="{by + 8}" fill="{MUTED}" font-size="10" font-family="{JP}">NULL を許す参照</text>')
        x += 164
        o(f'<text x="{x}" y="{by + 8}" fill="{MUTED}" font-size="10" font-family="{MONO}" font-weight="600">1 / N / 0..1</text>')
        o(f'<text x="{x + 76}" y="{by + 8}" fill="{MUTED}" font-size="10" font-family="{JP}">個数の関係</text>')


# ---------------------------------------------------------------- diagrams
def hub(slug, title, desc, hubname, left, right, left_extra=None):
    """中心に 1 つ、左右に 3 つずつ小さな表を並べる。left_extra=(name, 対象の左表の添字, ...) は最左の列。"""
    off = 1 if left_extra else 0
    d = Dia(slug, 3 + off, title, desc)
    S = d.top
    sat_y = [S, S + 164, S + 328]
    cy = [S + 110, S + 164 + 80, S + 376]
    hub_top = cy[0] - 44
    nlines = math.ceil((cy[2] + 12 - hub_top - 60) / 20)
    flds = E[hubname][2]
    assert len(flds) >= nlines - 1, (hubname, len(flds), nlines)
    shown = flds[: nlines - 1]
    d.add(hubname, 1 + off, hub_top, "focal", fields=shown, shown_total=E[hubname][1] - len(shown))
    for i, (nm, st, *_r) in enumerate(left):
        d.add(nm, off, sat_y[i], st)
    for i, (nm, st, *_r) in enumerate(right):
        d.add(nm, 2 + off, sat_y[i], st)
    for i, (nm, st, c_hub, c_sat, label, dash) in enumerate(left):
        d.hconn(nm, hubname, cy[i], c_sat, c_hub, label, dash)
    for i, (nm, st, c_hub, c_sat, label, dash) in enumerate(right):
        d.hconn(hubname, nm, cy[i], c_hub, c_sat, label, dash)
    return d


def build():
    dias = []

    # 1 開催とレース
    d = Dia("er-race", 4, "開催とレース",
            "開催がレースを持ち、レースが成績・レース名・レコードにつながる関係を示すER図。")
    T = d.top
    d.add("Kaisai", 0, T)
    d.add("KaisaiYosou", 0, d.below("Kaisai"))
    d.add("Race", 1, T, "focal")
    d.add("RaceSeiseki", 2, T)
    d.add("RaceMei", 2, d.below("RaceSeiseki"), "join")
    d.add("TokubetsuMei", 3, d.b("RaceMei")["y"])
    ry = d.below("Race")
    d.add("Record", 1, ry)
    d.add("RecordHoyuuba", 2, ry, "join")
    my = d.b("RaceMei")["y"] + 64
    d.hconn("Kaisai", "Race", T + 80, "1", "N", "KAISAIID")
    d.vconn("Kaisai", "KaisaiYosou", W // 2, "1", "0..1", "SAME ID")
    d.hconn("Race", "RaceSeiseki", T + 80, "1", "0..1", "SAME ID")
    d.hconn("Race", "RaceMei", my, "1", "N", "RACEID")
    d.hconn("RaceMei", "TokubetsuMei", my, "N", "1", "TOKUBETSUMEI")
    d.vconn("Race", "Record", 60, "1", "N", "RACEID", dash=True)
    d.vconn("Race", "Record", W - 60, "N", "0..1", "RECORDID ×3", dash=True)
    d.hconn("Record", "RecordHoyuuba", ry + 80, "1", "N", "RECORDID")
    dias.append(d)

    # 2 レースの付随データ
    dias.append(hub(
        "er-race-detail", "レースの付随データ",
        "レース1件に、経過・ラップ・票数・トラックバイアス・発走状況・オッズ配当が複数ぶら下がる関係を示すER図。",
        "Race",
        [("RaceKeika", "entity", "1", "N", "RACEID", False), ("RaceLapTime", "entity", "1", "N", "RACEID", False),
         ("RaceHyousuu", "entity", "1", "N", "RACEID", False)],
        [("RaceTrackBias", "entity", "1", "N", "RACEID", False),
         ("RaceHassouJoukyou", "entity", "1", "N", "RACEID", False),
         ("OddsHaitou", "entity", "1", "N", "RACEID", False)]))

    # 3 出走馬
    d = hub(
        "er-shussouba", "出走馬と、その成績・予想・評価",
        "出走馬1件に、成績・予想・評価が1対1で、状態・通過順が1対多でつながり、競走馬に属する関係を示すER図。",
        "Shussouba",
        [("ShussoubaSeiseki", "entity", "1", "0..1", "SAME ID", False),
         ("ShussoubaYosou", "entity", "1", "0..1", "SAME ID", False),
         ("ShussoubaHyouka", "entity", "1", "0..1", "SAME ID", False)],
        [("ShussoubaJoutai", "entity", "1", "N", "SHUSSOUBAID", False),
         ("ShussoubaTsuukaJuni", "entity", "1", "N", "SHUSSOUBAID", False),
         ("Kyousouba", "entity", "1", "N", "KYOUSOUBAID", False)],
        left_extra=True)
    # Kyousouba は出走馬が N、競走馬が 1
    d.conns[-1]["c1"], d.conns[-1]["c2"] = "N", "1"
    hy = d.b("ShussoubaYosou")["y"]
    d.add("Houbokusaki", 0, hy)
    d.hconn("Houbokusaki", "ShussoubaYosou", hy + 80, "1", "N", "HOUBOKUSAKI", dash=True)
    d.conns[-1]["c2"] = "N"
    dias.append(d)

    # 4 出走馬の経過・発走・調教
    d = Dia("er-shussouba-detail", 4, "出走馬の経過・発走状況・調教",
            "出走馬が、レース経過・発走状況の出走馬ごとの記録と、調教の対応表を通じて調教につながる関係を示すER図。")
    T = d.top
    d.add("RaceKeika", 0, T)
    d.add("RaceHassouJoukyou", 0, d.below("RaceKeika"))
    d.add("ShussoubaKeika", 1, T)
    d.add("ShussoubaHassouJoukyou", 1, d.below("ShussoubaKeika"))
    sh_top = T + 16
    d.add("Shussouba", 2, sh_top, "focal", nfields=10)
    d.add("ShussoubaChoukyou", 3, T, "join")
    d.add("Choukyou", 3, d.below("ShussoubaChoukyou"))
    d.add("ChoukyouTime", 3, d.below("Choukyou"))
    k1 = T + 76
    k2 = d.b("ShussoubaHassouJoukyou")["y"] + 64
    d.hconn("RaceKeika", "ShussoubaKeika", T + 76, "1", "N", "RACEKEIKAID")
    d.hconn("ShussoubaKeika", "Shussouba", k1, "N", "1", "SHUSSOUBAID")
    d.hconn("RaceHassouJoukyou", "ShussoubaHassouJoukyou", d.b("ShussoubaHassouJoukyou")["y"] + 64, "1", "N", "HASSOUID")
    d.hconn("ShussoubaHassouJoukyou", "Shussouba", k2, "N", "1", "SHUSSOUBAID")
    d.hconn("Shussouba", "ShussoubaChoukyou", T + 76, "1", "N", "SHUSSOUBAID")
    d.vconn("Choukyou", "ShussoubaChoukyou", W // 2, "1", "N", "CHOUKYOUID")
    d.vconn("Choukyou", "ChoukyouTime", W // 2, "1", "N", "CHOUKYOUID")
    dias.append(d)

    # 5 馬
    d = Dia("er-uma", 4, "馬・血統・取引",
            "馬が自己参照で父母を、系統・繁殖馬・市場取引・競走馬を持ち、競走馬が調教師に属する関係を示すER図。")
    T = d.top + 24
    d.add("Keitou", 0, T)
    d.add("Hanshokuba", 0, d.below("Keitou"))
    d.add("Uma", 1, T + 16, "focal")
    d.add("ShijouTorihiki", 2, T, "join")
    d.add("Kyousouba", 2, d.below("ShijouTorihiki"))
    d.add("Shijou", 3, T)
    d.add("Choukyoushi", 3, d.b("Kyousouba")["y"], "ref")
    u = d.b("Uma")
    d.hconn("Keitou", "Uma", T + 76, "0..1", "N", "KEITOUID", dash=False)
    d.conns[-1]["c1"], d.conns[-1]["c2"] = "1", "N"
    d.conns[-1]["dash"] = True
    d.hconn("Hanshokuba", "Uma", d.b("Hanshokuba")["y"] + 58, "N", "1", "UMAID")
    d.hconn("Uma", "ShijouTorihiki", T + 76, "1", "N", "UMAID")
    d.hconn("Uma", "Kyousouba", d.b("Kyousouba")["y"] + 70, "1", "N", "UMAID")
    d.hconn("ShijouTorihiki", "Shijou", T + 76, "N", "1", "SHIJOUCODE")
    d.hconn("Kyousouba", "Choukyoushi", d.b("Kyousouba")["y"] + 70, "N", "0..1", "CHOUKYOUSHIID", dash=True)
    x = u["x"]
    d.poly([(x + 56, u["y"]), (x + 56, u["y"] - 28), (x + 176, u["y"] - 28), (x + 176, u["y"])],
           "N", "0..1", "CHICHI/HAHA", dash=True, lseg=2)
    dias.append(d)

    # 6 馬主・生産者
    d = Dia("er-owner", 4, "馬主・生産者",
            "馬が日付ごとの馬主と生産者につながり、馬主と生産者の名前が所有者名の辞書を共有する関係を示すER図。")
    T = d.top
    y0 = T
    d.add("UmaBanushi", 1, y0, "join")
    d.add("Banushi", 2, y0, "focal")
    d.add("BanushiMei", 3, y0, "join")
    d.add("Shoyuu", 3, d.below("BanushiMei"))
    y2 = d.below("Shoyuu")
    d.add("SeisanshaMei", 3, y2, "join")
    d.add("Seisansha", 2, y2, "focal")
    d.add("Seisanba", 1, y2, "join")
    uy = (y0 + y2) // 2 + 20 - 60
    d.add("Uma", 0, uy, "ref", nfields=2)
    d.hconn("UmaBanushi", "Banushi", y0 + 76, "N", "1", "BANUSHIID")
    d.hconn("Banushi", "BanushiMei", y0 + 76, "1", "N", "BANUSHIID")
    d.vconn("Shoyuu", "BanushiMei", W // 2, "1", "N", "SHOYUUID")
    d.vconn("Shoyuu", "SeisanshaMei", W // 2, "1", "N", "SHOYUUID")
    d.hconn("Seisanba", "Seisansha", y2 + 76, "N", "1", "SEISANSHAID")
    d.hconn("Seisansha", "SeisanshaMei", y2 + 76, "1", "N", "SEISANSHAID")
    d.elbow_h("Uma", uy + 60, "UmaBanushi", y0 + 76, "1", "N")
    d.elbow_h("Uma", uy + 88, "Seisanba", y2 + 76, "1", "N")
    dias.append(d)

    # 7 騎手・調教師
    d = Dia("er-person", 3, "騎手・調教師と人名",
            "騎手と調教師が、それぞれの名前の対応表を通じて人名の辞書を共有し、騎手が所属の調教師を持つ関係を示すER図。")
    T = d.top
    d.add("Kishu", 0, T, "focal")
    d.add("Choukyoushi", 0, d.below("Kishu"), "focal")
    d.add("KishuMei", 1, T, "join")
    r1 = d.b("Choukyoushi")["y"]
    d.add("ChoukyoushiMei", 1, r1, "join")
    jy = (T + 76 + r1 + 76) // 2 - 74
    d.add("Jinmei", 2, jy)
    d.vconn("Kishu", "Choukyoushi", W // 2, "N", "0..1", "CHOUKYOUSHIID", dash=True)
    d.hconn("Kishu", "KishuMei", T + 76, "1", "N", "KISHUID")
    d.hconn("Choukyoushi", "ChoukyoushiMei", r1 + 76, "1", "N", "CHOUKYOUSHIID")
    d.elbow_h("KishuMei", T + 76, "Jinmei", jy + 60, "N", "1")
    d.elbow_h("ChoukyoushiMei", r1 + 76, "Jinmei", jy + 88, "N", "1")
    dias.append(d)

    # 8 着度数
    d = Dia("er-chakudosuu", 4, "着度数",
            "着度数と着度数集計が、馬・騎手・調教師・馬主・生産者のいずれかを対象として参照し、出走馬ごとの条件別着度数が出走馬に属する関係を示すER図。")
    T = d.top
    d.add("Taishou", 0, T + 16, "poly")
    d.add("Chakudosuu", 1, T, "focal")
    d.add("ChakudosuuShuukei", 1, d.below("Chakudosuu"), "focal")
    d.add("ShussoubaJoukenChakudosuu", 2, T)
    d.add("Shussouba", 3, T, "ref", nfields=2)
    d.hconn("Taishou", "Chakudosuu", T + 76, "1", "N", "TAISHOUID")
    sy = d.b("ChakudosuuShuukei")["y"] + 76
    d.elbow_h("Taishou", T + 16 + 120, "ChakudosuuShuukei", sy, "1", "N")
    d.vconn("Chakudosuu", "ChakudosuuShuukei", W // 2, "1", "0..1", "SAME KEY")
    d.hconn("ShussoubaJoukenChakudosuu", "Shussouba", T + 76, "N", "1", "SHUSSOUBAID")
    dias.append(d)

    # 9 重勝式・特別登録・投票除外
    d = Dia("er-win5", 4, "重勝式・特別登録馬・投票除外馬",
            "重勝式が対象レースと払戻を持ち、特別登録馬と投票除外馬がレースに属する関係を示すER図。")
    T = d.top
    d.add("Win5", 0, T)
    d.add("Win5Haraimodoshi", 0, d.below("Win5"))
    d.add("Win5Race", 1, T, "join")
    d.add("Race", 2, T + 16, "ref", nfields=12)
    d.add("TokubetsuTourokuba", 3, T)
    d.add("TouhyouJogaiba", 3, d.below("TokubetsuTourokuba"))
    d.hconn("Win5", "Win5Race", T + 76, "1", "N", "NENGAPPI")
    d.vconn("Win5", "Win5Haraimodoshi", W // 2, "1", "N", "NENGAPPI")
    d.hconn("Win5Race", "Race", T + 76, "N", "1", "RACEID")
    d.hconn("Race", "TokubetsuTourokuba", T + 76, "1", "N", "RACEID")
    d.hconn("Race", "TouhyouJogaiba", d.b("TouhyouJogaiba")["y"] + 76, "1", "N", "RACEID")
    dias.append(d)

    return dias


ORDER = [
    ("er-race", "開催とレース", "Kaisai · Race · Record の骨格。レース名は対応表 RaceMei を介して特別競走名につながる。"),
    ("er-race-detail", "レースの付随データ", "レースごとの経過・ラップ・票数・バイアス・発走状況・オッズ配当。すべて RaceId で 1 対多。"),
    ("er-shussouba", "出走馬", "Shussouba を中心に、成績・予想・評価 (Id を共有する 1 対 1) と、状態・通過順 (1 対多)。"),
    ("er-shussouba-detail", "出走馬の経過・発走状況・調教", "レース単位の記録を、出走馬ごとに切り分けた表と、調教との対応表。"),
    ("er-uma", "馬・血統・取引", "Uma の自己参照 (父・母) と、系統・繁殖馬・市場取引・競走馬。"),
    ("er-owner", "馬主・生産者", "馬の馬主は日付ごと。馬主名と生産者名は Shoyuu (所有者名) の辞書を共有する。"),
    ("er-person", "騎手・調教師と人名", "Kishu / Choukyoushi の名前は対応表を介して Jinmei を共有する。"),
    ("er-chakudosuu", "着度数", "Chakudosuu は Taishou 列と TaishouId で 5 種類の表を指す (多態参照のため外部キーは張らない)。"),
    ("er-win5", "重勝式・特別登録馬・投票除外馬", "Win5 は開催日が主キー。特別登録馬・投票除外馬は Race と Uma の複合主キー。"),
]


def page(dias):
    by = {d.slug: d for d in dias}
    cards = "\n".join(
        f'<li><a href="#{slug}"><span class="n">{i + 1:02d}</span><span class="t">{esc(t)}</span>'
        f'<span class="e">{esc(" · ".join(n for n in by[slug].boxes if n != "Taishou"))}</span></a></li>'
        for i, (slug, t, _) in enumerate(ORDER))
    figs = []
    for i, (slug, t, note) in enumerate(ORDER):
        figs.append(f'''<section id="{slug}">
  <p class="eyebrow">ER · {i + 1:02d} / {len(ORDER):02d}</p>
  <h2>{esc(t)}</h2>
  <p class="note">{esc(note)}</p>
  <div class="diagram-container">
{by[slug].render()}
  </div>
</section>''')
    return PAGE.replace("@@CARDS@@", cards).replace("@@FIGS@@", "\n".join(figs))


PAGE = '''<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>KeibaDataImporter ER図</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500;600&family=Noto+Sans+JP:wght@400;500&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --paper: #f5f5f5; --ink: #2d3142; --muted: #4f5d75; --accent: #bf4520; --rule: rgba(45,49,66,0.12);
  --sans: 'Geist', 'Noto Sans JP', 'Hiragino Sans', system-ui, sans-serif;
  --serif: 'Instrument Serif', 'Noto Sans JP', serif;
  --mono: 'Geist Mono', ui-monospace, monospace;
}
body { font-family: var(--sans); background: var(--paper); color: var(--ink); padding: 3rem 16px 4rem; line-height: 1.6; }
.frame { max-width: 1280px; margin: 0 auto; }
.eyebrow { font-family: var(--mono); font-size: 0.66rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.5rem; }
h1 { font-family: var(--serif); font-size: clamp(1.6rem, 2.4vw + 0.75rem, 2.25rem); font-weight: 400; letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 0.75rem; }
h2 { font-family: var(--serif); font-size: 1.5rem; font-weight: 400; letter-spacing: -0.01em; line-height: 1.2; margin-bottom: 0.5rem; }
.lead { color: var(--muted); font-size: 0.9rem; max-width: 62ch; margin-bottom: 2rem; }
.note { color: var(--muted); font-size: 0.85rem; max-width: 72ch; margin-bottom: 1rem; }
.index { list-style: none; display: grid; grid-template-columns: 1.1fr 1fr 0.9fr; gap: 12px; margin-bottom: 3.5rem; }
.index a { display: grid; grid-template-columns: auto 1fr; column-gap: 12px; row-gap: 4px; padding: 1rem 1.25rem; background: #fff; border: 1px solid var(--rule); border-radius: 6px; color: inherit; text-decoration: none; height: 100%; }
.index a:hover { border-color: var(--accent); }
.index .n { font-family: var(--mono); font-size: 0.7rem; color: var(--accent); padding-top: 0.2rem; }
.index .t { font-weight: 600; font-size: 0.9rem; }
.index .e { grid-column: 2; font-family: var(--mono); font-size: 0.64rem; color: var(--muted); line-height: 1.5; }
section { margin-bottom: 4rem; scroll-margin-top: 1.5rem; }
.diagram-container { width: 100%; overflow-x: auto; }
svg { width: 100%; display: block; }
.foot { border-top: 1px solid var(--rule); padding-top: 1rem; margin-top: 1rem; color: var(--muted); font-family: var(--mono); font-size: 0.68rem; line-height: 1.8; }
.foot b { color: var(--ink); font-weight: 600; }
@media (max-width: 860px) { .index { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="frame">
  <p class="eyebrow">ER · src/app/entities</p>
  <h1>KeibaDataImporter ER図</h1>
  <p class="lead">entities の 54 表を、9 枚の図に分けた。1 枚に 8 表まで。各表には主キーと外部キー、主な列だけを載せ、残りは「他 N 列」にまとめている。外部キー制約は定義していないので、線は <code>…Id</code> 列から読み取った論理的な関係。</p>
  <ol class="index">
@@CARDS@@
  </ol>
@@FIGS@@
  <div class="foot">
    <p><b>どの図にも出ない表</b> · CourseSetsumei (場所・距離・トラックコード・改修日が主キー。Race とは列の値で対応し、外部キーは持たない)</p>
    <p><b>表ではない定義</b> · MeishouKubun (人名・所有者名の区分を表す定数。KishuMei などの Kubun 列が使う)</p>
    <p><b>出典</b> · src/app/entities/*.ts (drizzle の sqliteTable 定義)</p>
  </div>
</div>
</body>
</html>
'''


if __name__ == "__main__":
    import re
    ds = build()
    names = set()
    for d in ds:
        names |= set(d.boxes)
    out = page(ds)
    open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "docs/er-diagram.html"), "w").write(out)
    ents = {f[:-3] for f in os.listdir(os.path.join(ROOT, "src/app/entities")) if f.endswith(".ts") and f != "index.ts"}
    print("missing:", sorted(ents - names - {"CourseSetsumei", "MeishouKubun"}))
    print("unknown:", sorted(names - ents - {"Taishou"}))
    for d in ds:
        print(d.slug, len(d.boxes), len(d.conns))
