import { DirtShiba } from "../../converters/Race";

export interface JravanTrackInfo {
  dirtShiba: DirtShiba;
  /** 0:右 1:左 2:直線 (障害は null) */
  migiHidari: number | null;
  /** 0:内 1:外 2:外→内 5:内2周 6:内→外 (指定のないものは null) */
  uchiSoto: number | null;
}

const T = (dirtShiba: DirtShiba, migiHidari: number | null, uchiSoto: number | null) => ({
  dirtShiba,
  migiHidari,
  uchiSoto,
});

/**
 * コード表 2009 トラックコード。
 * 内外の区別が仕様書にない（単に「左」「右」など）ものは、KOL に合わせて「内」としている。
 */
const tracks: { [code: string]: JravanTrackInfo } = {
  "10": T(DirtShiba.Shiba, 2, null),
  "11": T(DirtShiba.Shiba, 1, 0),
  "12": T(DirtShiba.Shiba, 1, 1),
  "13": T(DirtShiba.Shiba, 1, 6),
  "14": T(DirtShiba.Shiba, 1, 2),
  "15": T(DirtShiba.Shiba, 1, 5),
  "16": T(DirtShiba.Shiba, 1, 1),
  "17": T(DirtShiba.Shiba, 0, 0),
  "18": T(DirtShiba.Shiba, 0, 1),
  "19": T(DirtShiba.Shiba, 0, 6),
  "20": T(DirtShiba.Shiba, 0, 2),
  "21": T(DirtShiba.Shiba, 0, 5),
  "22": T(DirtShiba.Shiba, 0, 1),
  "23": T(DirtShiba.Dirt, 1, 0),
  "24": T(DirtShiba.Dirt, 0, 0),
  "29": T(DirtShiba.Dirt, 2, null),
  "51": T(DirtShiba.Shiba, null, null),
  "52": T(DirtShiba.Shiba, null, null),
  "53": T(DirtShiba.Shiba, 1, 0),
  "54": T(DirtShiba.Shiba, null, 0),
  "55": T(DirtShiba.Shiba, null, 1),
  "56": T(DirtShiba.Shiba, null, 2),
  "57": T(DirtShiba.Shiba, null, 6),
  "58": T(DirtShiba.Shiba, null, 5),
  "59": T(DirtShiba.Shiba, null, 1),
};

/** トラックコードの内容。海外・地方成績の既定値 "00" や未知のコードは null */
export function getJravanTrack(code: string): JravanTrackInfo | null {
  return tracks[code] ?? null;
}
