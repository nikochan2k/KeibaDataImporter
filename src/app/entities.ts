import { Entity, Index, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity("Race")
@Index("IxRace1", (r: Race) => [r.Nengappi, r.KaisaiBasho, r.RaceBangou])
export class Race {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("smallint")
  public KaisaiBasho: number;

  @Column("smallint")
  public KaisaiNen: number;

  @Column("smallint")
  public KaisaiKaiji: number;

  @Column("smallint")
  public KaisaiNichiji: number;

  @Column("smallint")
  public RaceBangou: number;

  @Column("date")
  public Nengappi: Date;

  @Column("smallint")
  public Kyuujitsu: number;

  @Column("smallint")
  public Youbi: number;

  @Column("smallint", { nullable: true })
  public KouryuuFlag?: number;

  @Column("smallint")
  public ChuuouChihouGaikoku: number;

  @Column("smallint")
  public IppanTokubetsu: number;

  @Column("smallint")
  public HeichiShougai: number;

  @Column("smallint", { nullable: true })
  public JuushouKaisuu?: number;

  @Column("string", { nullable: true, length: 45 })
  public TokubetsuMei: string;

  @Column("string", { nullable: true, length: 21 })
  public TanshukuTokubetsuMei: string;

  @Column("smallint", { nullable: true })
  public Grade?: number;

  @Column("smallint", { nullable: true })
  public JpnFlag?: number;

  @Column("smallint", { nullable: true })
  public BetteiBareiHandi?: number;

  @Column("string", { nullable: true, length: 27 })
  public BetteiBareiHandiShousai: string;

  @Column("smallint", { nullable: true })
  public JoukenFuka1?: number;

  @Column("smallint", { nullable: true })
  public JoukenFuka2?: number;

  @Column("smallint")
  public JoukenKei: number;

  @Column("smallint")
  public JoukenNenreiSeigen: number;

  @Column("smallint", { nullable: true })
  public Jouken1?: number;

  @Column("smallint", { nullable: true })
  public Kumi1?: number;

  @Column("smallint", { nullable: true })
  public IjouIkaMiman?: number;

  @Column("smallint", { nullable: true })
  public Jouken2?: number;

  @Column("smallint", { nullable: true })
  public Kumi2?: number;

  @Column("smallint")
  public DirtShiba: number;

  @Column("smallint")
  public MigiHidari: number;

  @Column("smallint", { nullable: true })
  public UchiSoto?: number;

  @Column("smallint", { nullable: true })
  public Course?: number;

  @Column("smallint")
  public Kyori: number;

  @Column("int", { nullable: true })
  public Shoukin1Chaku?: number;

  @Column("int", { nullable: true })
  public Shoukin2Chaku?: number;

  @Column("int", { nullable: true })
  public Shoukin3Chaku?: number;

  @Column("int", { nullable: true })
  public Shoukin4Chaku?: number;

  @Column("int", { nullable: true })
  public Shoukin5Chaku?: number;

  @Column("int", { nullable: true })
  public Shoukin5ChakuDouchaku1?: number;

  @Column("int", { nullable: true })
  public Shoukin5ChakuDouchaku2?: number;

  @Column("smallint", { nullable: true })
  public FukaShou?: number;

  @Column("smallint", { nullable: true })
  public MaeuriFlag?: number;

  @Column("string", { nullable: true, length: 5 })
  public YoteiHassouJikan: string;

  @Column("smallint")
  public Tousuu: number;

  @Column("smallint")
  public TorikeshiTousuu: number;

  @Column("smallint", { nullable: true })
  public Pace?: number;

  @Column("smallint", { nullable: true })
  public Tenki?: number;

  @Column("smallint", { nullable: true })
  public Baba?: number;

  @Column("smallint", { nullable: true })
  public Seed?: number;

  @Column("float", { nullable: true })
  public ShougaiHeikin1F?: number;

  @Column("date", { nullable: true })
  public SeisekiSakuseiNengappi?: Date;
}

@Entity("RaceYosou")
export class RaceYosou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("float", { nullable: true })
  public SuiteiTimeRyou?: number;

  @Column("float", { nullable: true })
  public SuiteiTimeOmoFuryou?: number;

  @Column("smallint", { nullable: true })
  public YosouPace?: number;

  @Column("date", { nullable: true })
  public ShutsubahyouSakuseiNengappi?: Date;

  @Column("string", { nullable: true })
  public RaceTanpyou?: string;

  @Column("string", { nullable: true, length: 18 })
  public Yosoushamei2: string;
}

@Entity("RaceYosouTenkai")
@Index("IxRaceYosouTenkai", (ryt: RaceYosouTenkai) => [ryt.RaceId])
export class RaceYosouTenkai {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("smallint")
  public Tenkai: number; // 1:逃げ 2:先行 3:差し 4:追込

  @Column("smallint")
  public Umaban1: number;

  @Column("smallint", { nullable: true })
  public Umaban2?: number;

  @Column("smallint", { nullable: true })
  public Umaban3?: number;

  @Column("smallint", { nullable: true })
  public Umaban4?: number;
}

@Entity("RaceRecord")
@Index("IxRaceRecord", (rr: RaceRecord) => [rr.RaceId])
export class RaceRecord {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("smallint")
  public RecordShubetsu: number; // 1:コースレコード 2:距離レコード 3:レースレコード

  @Column("date")
  public Nengappi: Date;

  @Column("float")
  public Time: number;

  @Column("string", { length: 45 })
  public Bamei: string;

  @Column("float")
  public Kinryou: number;

  @Column("string", { length: 12 })
  public TanshukuKishuMei: string;

  @Column("smallint", { nullable: true })
  public Basho?: number;
}

@Entity("RaceLapTime")
@Index("IxRaceLapTime", (rlt: RaceLapTime) => [rlt.RaceId])
export class RaceLapTime {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("smallint")
  public KaishiKyori: number;

  @Column("smallint")
  public ShuuryouKyori: number;

  @Column("float")
  public LapTime: number;
}

@Entity("RaceHaitou")
@Index("IxRaceHaitou", (rh: RaceHaitou) => [rh.RaceId, rh.BakenShubetsu])
export class RaceHaitou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("smallint")
  public BakenShubetsu: number; // 1:単勝 2:複勝 3:枠連 4:馬連 5:ワイド 6:馬単 7:三連複 8:三連単

  @Column("smallint")
  public Bangou1: number;

  @Column("smallint", { nullable: true })
  public Bangou2?: number;

  @Column("smallint", { nullable: true })
  public Bangou3?: number;

  @Column("int")
  public Haitoukin: number;
}

@Entity("OddsKubun")
@Index("IxOddsKubun", (ok: OddsKubun) => [ok.RaceId, ok.YosouKakutei, ok.BakenShubetsu])
export class OddsKubun {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("smallint")
  public YosouKakutei: number;

  @Column("smallint")
  public BakenShubetsu: number;

  @Column("date")
  public DataSakuseiNengappi: number;
}

@Entity("Odds")
@Index("IxOdds", (o: Odds) => [o.OddsKubunId])
export class Odds {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("bigint")
  public OddsKubunId: number;

  @Column("smallint")
  public Bangou1: number;

  @Column("smallint", { nullable: true })
  public Bangou2?: number;

  @Column("smallint", { nullable: true })
  public Bangou3?: number;

  @Column("smallint", { nullable: true })
  public Odds1: number;

  @Column("smallint", { nullable: true })
  public Odds2: number;
}

@Entity("Shussouba")
@Index("IxShussouba1", (s: Shussouba) => [s.RaceId, s.Umaban])
@Index("IxShussouba2", (s: Shussouba) => [s.Time])
@Index("IxShussouba3", (s: Shussouba) => [s.Zenhan3F])
@Index("IxShussouba4", (s: Shussouba) => [s.Kouhan3F])
@Index("IxShussouba5", (s: Shussouba) => [s.KyousoubaId])
@Index("IxShussouba6", (s: Shussouba) => [s.KishuId])
@Index("IxShussouba7", (s: Shussouba) => [s.KyuushaId])
export class Shussouba {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("smallint")
  public Wakuban: number;

  @Column("smallint")
  public Umaban: number;

  @Column("smallint")
  public Gate: number;

  @Column("string", { length: 7 })
  public KyousoubaId: string;

  @Column("string", { length: 45 })
  public KanaBamei: string;

  @Column("smallint", { nullable: true })
  public UmaKigou?: number;

  @Column("smallint")
  public Seibetsu: number;

  @Column("smallint")
  public Nenrei: number;

  @Column("string", { length: 60 })
  public BanushiMei: string;

  @Column("string", { length: 30 })
  public TanshukuBanushiMei: string;

  @Column("smallint", { nullable: true })
  public Blinker: number;

  @Column("float", { nullable: true })
  public Kinryou: number;

  @Column("smallint", { nullable: true })
  public Bataijuu: number;

  @Column("smallint", { nullable: true })
  public Zougen: number;

  @Column("smallint", { nullable: true })
  public RecordShisuu: number;

  @Column("int")
  public KishuId: number;

  @Column("string", { length: 48 })
  public KishuMei: string;

  @Column("string", { length: 12 })
  public TanshukuKishuMei: string;

  @Column("smallint", { nullable: true })
  public KishuTouzaiBetsu?: number;

  @Column("smallint", { nullable: true })
  public KishuShozokuBasho?: number;

  @Column("smallint", { nullable: true })
  public KishuShozokuKyuushaId?: number;

  @Column("smallint", { nullable: true })
  public MinaraiKubun?: number;

  @Column("smallint", { nullable: true })
  public Norikawari?: number;

  @Column("int", { nullable: true })
  public KyuushaId?: number;

  @Column("string", { length: 48 })
  public KyuushaMei?: string;

  @Column("string", { length: 12 })
  public TanshukuKyuushaMei?: string;

  @Column("smallint", { nullable: true })
  public KyuushaShozokuBasho?: number;

  @Column("smallint", { nullable: true })
  public KyuushaRitsuHokuNanBetsu?: number;

  @Column("smallint", { nullable: true })
  public YosouShirushi?: number;

  @Column("smallint", { nullable: true })
  public YosouShirushiHonshi?: number;

  @Column("smallint", { nullable: true })
  public Ninki?: number;

  @Column("float", { nullable: true })
  public Odds?: number;

  @Column("smallint", { nullable: true })
  public KakuteiChakujun?: number;

  @Column("smallint", { nullable: true })
  public ChakujunFuka?: number;

  @Column("smallint", { nullable: true })
  public NyuusenChakujun?: number;

  @Column("smallint", { nullable: true })
  public TorikeshiShubetsu?: number;

  @Column("smallint", { nullable: true })
  public RecordNinshiki?: number;

  @Column("float", { nullable: true })
  public Time?: number;

  @Column("smallint", { nullable: true })
  public Chakusa1?: number;

  @Column("smallint", { nullable: true })
  public Chakusa2?: number;

  @Column("float", { nullable: true })
  public TimeSa?: number;

  @Column("float", { nullable: true })
  public Zenhan3F?: number;

  @Column("float", { nullable: true })
  public Kouhan3F?: number;

  @Column("smallint", { nullable: true })
  public YonCornerIchiDori?: number;

  @Column("smallint")
  public Seinen: number;

  @Column("date", { nullable: true })
  public ShutsubahyouSakuseiNengappi?: Date;

  @Column("date", { nullable: true })
  public SeisekiSakuseiNengappi?: Date;
}

@Entity("Kishu")
@Index("IxKishu1", (k: Kishu) => [k.KishuMei])
@Index("IxKishu2", (k: Kishu) => [k.TanshukuKishuMei])
export class Kishu {
  @PrimaryColumn("int")
  public Id: number;

  @Column("string", { length: 48 })
  public KishuMei: string;

  @Column("string", { length: 12 })
  public TanshukuKishuMei: string;

  @Column("string", { length: 72, nullable: true })
  public Furigana?: string;

  @Column("date", { nullable: true })
  public Seinengappi?: Date;

  @Column("smallint", { nullable: true })
  public HatsuMenkyoNen?: number;

  @Column("smallint", { nullable: true })
  public KishuTouzaiBetsu?: number;

  @Column("smallint", { nullable: true })
  public KishuShozokuBasho?: number;

  @Column("smallint", { nullable: true })
  public KishuShikakuKubun?: number;

  @Column("smallint", { nullable: true })
  public MinaraiKubun?: number;

  @Column("smallint", { nullable: true })
  public KishuShozokuKyuushaId?: number;

  @Column("string", { length: 48 })
  public KishuShozokuKyuushaMei: string;

  @Column("string", { length: 12 })
  public TanshukuKyuushaMei: string;

  @Column("smallint", { nullable: true })
  public KyuushaShozokuBasho?: number;

  @Column("smallint", { nullable: true })
  public KyuushaRitsuHokuNanBetsu?: number;

  @Column("smallint", { nullable: true })
  public TourokuMasshouFlag?: number;

  @Column("date", { nullable: true })
  public DataSakuseiNengappi?: Date;
}

@Entity("Kyuusha")
@Index("IxKyuusha1", (k: Kyuusha) => [k.KyuushaMei])
@Index("IxKyuusha2", (k: Kyuusha) => [k.TanshukuKyuushaMei])
export class Kyuusha {
  @PrimaryColumn("int")
  public Id: number;

  @Column("string", { length: 48 })
  public KyuushaMei: string;

  @Column("string", { length: 12 })
  public TanshukuKyuushaMei: string;

  @Column("string", { length: 72, nullable: true })
  public Furigana?: string;

  @Column("date", { nullable: true })
  public Seinengappi?: Date;

  @Column("smallint", { nullable: true })
  public HatsuMenkyoNen?: number;

  @Column("smallint", { nullable: true })
  public KyuushaTouzaiBetsu?: number;

  @Column("smallint", { nullable: true })
  public KyuushaShozokuBasho?: number;

  @Column("smallint", { nullable: true })
  public KyuushaRitsuHokuNanBetsu?: number;

  @Column("smallint", { nullable: true })
  public TourokuMasshouFlag?: number;

  @Column("date", { nullable: true })
  public DataSakuseiNengappi?: Date;
}

@Entity("Choukyou")
@Index("IxChoukyou", (c: Choukyou) => [c.KyousoubaId])
export class Choukyou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("string", { length: 7 })
  public KyousoubaId: string;

  @Column("string", { length: 7, nullable: true })
  public Tanpyou?: string;

  @Column("smallint", { nullable: true })
  public HonsuuCourse?: number;

  @Column("smallint", { nullable: true })
  public HonsuuHanro?: number;

  @Column("smallint", { nullable: true })
  public HonsuuPool?: number;

  @Column("float", { nullable: true })
  public Rating?: number;

  @Column("string", { length: 90, nullable: true })
  public KyuuyouRiyuu?: string;
}

@Entity("ChoukyouRireki")
@Index("IxChoukyouRireki", (cr: ChoukyouRireki) => [cr.ChoukyouId])
export class ChoukyouRireki {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public ChoukyouId: number;

  @Column("smallint", { nullable: true })
  public Oikiri?: number;

  @Column("string", { length: 12 })
  public Kijousha?: string;

  @Column("date", { nullable: true })
  public Nengappi?: Date;

  @Column("string", { length: 9, nullable: true })
  public Basho?: string;

  @Column("string", { length: 3, nullable: true })
  public ChoukyouCourse?: string;

  @Column("string", { length: 3, nullable: true })
  public ChoukyouBaba?: string;

  @Column("smallint", { nullable: true })
  public Kaisuu?: number;

  @Column("smallint", { nullable: true })
  public IchiDori?: number;

  @Column("string", { length: 9, nullable: true })
  public Ashiiro?: string;

  @Column("smallint", { nullable: true })
  public Yajirushi?: number;

  @Column("string", { length: 60, nullable: true })
  public Reigai?: string;

  @Column("string", { length: 129, nullable: true })
  public Awase?: string;
}

@Entity("ChoukyouTime")
@Index("IxChoukyouTime", (ct: ChoukyouTime) => [ct.ChoukyouRirekiId, ct.F])
export class ChoukyouTime {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public ChoukyouRirekiId: number;

  @Column("smallint")
  public F: number;

  @Column("float", { nullable: true })
  public Time?: number;

  @Column("string", { length: 9, nullable: true })
  public Comment?: string;
}

@Entity("ShussoubaTsuukaJuni")
@Index("IxShussoubaTsuukaJuni", (stj: ShussoubaTsuukaJuni) => [stj.ShussoubaId])
export class ShussoubaTsuukaJuni {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public ShussoubaId: string;

  @Column("smallint")
  public Bangou: number;

  @Column("smallint", { nullable: true })
  public Juni?: number;

  @Column("smallint", { nullable: true })
  public Joukyou?: number;
}

@Entity("RaceHassouJoukyou")
@Index("IxRaceHassouJoukyou", (rhj: RaceHassouJoukyou) => [rhj.RaceId])
export class RaceHassouJoukyou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("string", { length: 120, nullable: true })
  public HassouJoukyou: string;
}

@Entity("ShussoubaHassouJoukyou")
@Index("IxShussoubaHassouJoukyou", (shj: ShussoubaHassouJoukyou) =>
  [shj.RaceHassouJoukyouId, shj.ShussoubaId])
export class ShussoubaHassouJoukyou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceHassouJoukyouId: number;

  @Column("bigint")
  public ShussoubaId: number;
}

@Entity("RaceKeika")
@Index("IxRaceKeika", (rk: RaceKeika) => [rk.RaceId])
export class RaceKeika {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("string", { length: 165 })
  public Keika: string;

  @Column("smallint", { nullable: true })
  public Midashi1?: number;

  @Column("smallint", { nullable: true })
  public Midashi2?: number;
}

@Entity("ShussoubaKeika")
@Index("IxShussoubaKeika", (sk: ShussoubaKeika) => [sk.RaceKeikaId, sk.ShussoubaId])
export class ShussoubaKeika {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceKeikaId: number;

  @Column("bigint")
  public ShussoubaId: number;

  @Column("smallint")
  public TateCount: number;

  @Column("smallint")
  public TateHanareteCount: number;

  @Column("smallint")
  public TateOokikuHanareteCount: number;

  @Column("smallint")
  public YokoCount: number;
}

@Entity("Kyousouba")
@Index("IxKyousouba", (k: Kyousouba) => [k.KanaBamei])
export class Kyousouba {
  @PrimaryColumn("string", { length: 7 })
  public Id: string;

  @Column("string", { length: 45 })
  public KanaBamei: string;

  @Column("string", { length: 60 })
  public KyuuBamei?: string;

  @Column("date", { nullable: true })
  public Seinengappi?: Date;

  @Column("smallint", { nullable: true })
  public Keiro?: number;

  @Column("smallint", { nullable: true })
  public Kesshu?: number;

  @Column("smallint", { nullable: true })
  public Sanchi?: number;

  @Column("smallint", { nullable: true })
  public UmaKigou?: number;

  @Column("smallint", { nullable: true })
  public Seibetsu?: number;

  @Column("string", { length: 7, nullable: true })
  public ChichiUmaId?: string;

  @Column("string", { length: 51, nullable: true })
  public ChichiUmaMei?: string;

  @Column("string", { length: 7, nullable: true })
  public HahaUmaId?: string;

  @Column("string", { length: 51, nullable: true })
  public HahaUmaMei?: string;

  @Column("string", { length: 7, nullable: true })
  public HahaChichiUmaId?: string;

  @Column("string", { length: 51, nullable: true })
  public HahaChichiUmaMei?: string;

  @Column("string", { length: 7, nullable: true })
  public HahaHahaUmaId?: string;

  @Column("string", { length: 51, nullable: true })
  public HahaHahaUmaMei?: string;

  @Column("string", { length: 60, nullable: true })
  public BanushiMei?: string;

  @Column("string", { length: 30, nullable: true })
  public TanshukuBanushiMei?: string;

  @Column("string", { length: 60, nullable: true })
  public SeisanshaMei?: string;

  @Column("string", { length: 30, nullable: true })
  public TanshukuSeisanshaMei?: string;

  @Column("int", { nullable: true })
  public KyuushaId?: number;

  @Column("string", { length: 48, nullable: true })
  public KyuushaMei?: string;

  @Column("string", { length: 12, nullable: true })
  public TanshukuKyuushaMei?: string;

  @Column("smallint", { nullable: true })
  public KyuushaShozokuBasho?: number;

  @Column("smallint", { nullable: true })
  public KyuushaRitsuHokuNanBetsu?: number;

  @Column("string", { length: 12, nullable: true })
  public KoueiGaikokuKyuushaMei?: string;

  @Column("smallint", { nullable: true })
  public MasshouFlag?: number;

  @Column("date", { nullable: true })
  public MasshouNengappi?: Date;

  @Column("string", { length: 9, nullable: true })
  public Jiyuu?: string;

  @Column("string", { length: 15, nullable: true })
  public Ikisaki?: string;

  @Column("smallint", { nullable: true })
  public ChichiKyoriTekisei?: number;

  @Column("smallint", { nullable: true })
  public HirabaOmoKousetsu?: number;

  @Column("smallint", { nullable: true })
  public HirabaDirtKousetsu?: number;

  @Column("smallint", { nullable: true })
  public ShougaiOmoKousetsu?: number;

  @Column("smallint", { nullable: true })
  public ShougaiDirtKousetsu?: number;

  @Column("date", { nullable: true })
  public DataSakuseiNengappi?: number;
}

@Entity("Code")
export class Code {
  @PrimaryColumn("string", { length: 30 })
  public Domain: string;

  @PrimaryColumn("smallint")
  public Key: number;

  @Column("string", { length: 30 })
  public Val: string;
}