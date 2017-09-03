import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("Shussouba")
@Index("IxShussouba1", (s: Shussouba) => [s.RaceId, s.Umaban])
@Index("IxShussouba2", (s: Shussouba) => [s.Time])
@Index("IxShussouba3", (s: Shussouba) => [s.Ten3F])
@Index("IxShussouba4", (s: Shussouba) => [s.Agari3F])
@Index("IxShussouba5", (s: Shussouba) => [s.KyousoubaId])
@Index("IxShussouba6", (s: Shussouba) => [s.KishuId])
export class Shussouba {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("smallint", { nullable: true })
  public Wakuban?: number;

  @Column("smallint")
  public Umaban: number;

  @Column("smallint", { nullable: true })
  public Gate?: number;

  @Column("int", { nullable: true })
  public KyousoubaId: number;

  @Column("smallint")
  public Nenrei: number;

  @Column("smallint", { nullable: true })
  public Blinker?: number;

  @Column("float", { nullable: true })
  public Kinryou?: number;

  @Column("smallint", { nullable: true })
  public Bataijuu?: number;

  @Column("smallint", { nullable: true })
  public Zougen?: number;

  @Column("smallint", { nullable: true })
  public KolRecordShisuu?: number;

  @Column("int")
  public KishuId: number;

  @Column("smallint", { nullable: true })
  public KishuTouzaiBetsu?: number;

  @Column("smallint", { nullable: true })
  public KishuShozokuBasho?: number;

  @Column("int", { nullable: true })
  public KishuShozokuKyuushaId?: number;

  @Column("smallint", { nullable: true })
  public MinaraiKubun: number;

  @Column("int", { nullable: true })
  public KyuuKijouId?: number;

  @Column("smallint", { nullable: true })
  public Norikawari?: number;

  @Column("smallint", { nullable: true })
  public KolYosou1?: number;

  @Column("smallint", { nullable: true })
  public KolYosou2?: number;

  @Column("smallint", { nullable: true })
  public JrdbSougouShirushi?: number;

  @Column("smallint", { nullable: true })
  public JrdbIdmShirushi?: number;

  @Column("smallint", { nullable: true })
  public JrdbJouhouShirushi?: number;

  @Column("smallint", { nullable: true })
  public JrdbKishuShirushi?: number;

  @Column("smallint", { nullable: true })
  public JrdbKyuushaShirushi?: number;

  @Column("smallint", { nullable: true })
  public JrdbChoukyouShirushi?: number;

  @Column("smallint", { nullable: true })
  public JrdbGekisouShirushi?: number;

  @Column("smallint", { nullable: true })
  public ShibaTekisei?: number;

  @Column("smallint", { nullable: true })
  public DirtTekisei?: number;

  @Column("smallint", { nullable: true })
  public TokuteiJouhouHonmei?: number;

  @Column("smallint", { nullable: true })
  public TokuteiJouhouTaikou?: number;

  @Column("smallint", { nullable: true })
  public TokuteiJouhouTanana?: number;

  @Column("smallint", { nullable: true })
  public TokuteiJouhouRenshita?: number;

  @Column("smallint", { nullable: true })
  public TokuteiJouhouAna?: number;

  @Column("smallint", { nullable: true })
  public SougouJouhouHonmei?: number;

  @Column("smallint", { nullable: true })
  public SougouJouhouTaikou?: number;

  @Column("smallint", { nullable: true })
  public SougouJouhouTanana?: number;

  @Column("smallint", { nullable: true })
  public SougouJouhouRenshita?: number;

  @Column("smallint", { nullable: true })
  public SougouJouhouAna?: number;

  @Column("smallint", { nullable: true })
  public Ninki?: number;

  @Column("float", { nullable: true })
  public Odds?: number;

  @Column("smallint", { nullable: true })
  public FukushouNinki?: number;

  @Column("float", { nullable: true })
  public FukushouOdds?: number;

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
  public Ten3F?: number;

  @Column("float", { nullable: true })
  public Ten3FIkou?: number;

  @Column("float", { nullable: true })
  public Chuukan?: number;

  @Column("float", { nullable: true })
  public Agari3FIzen?: number;

  @Column("float", { nullable: true })
  public Agari3F?: number;

  @Column("smallint", { nullable: true })
  public YonCornerIchiDori?: number;

  @Column("smallint", { nullable: true })
  public KyuuyouRiyuuCode?: number;

  @Column("smallint", { nullable: true })
  public ChoukyouYajirushi?: number;

  @Column("varchar", { length: 7, nullable: true })
  public ChoukyouTanpyou?: string;

  @Column("smallint", { nullable: true })
  public ChoukyouHonsuuCourse?: number;

  @Column("smallint", { nullable: true })
  public ChoukyouHonsuuHanro?: number;

  @Column("smallint", { nullable: true })
  public ChoukyouHonsuuPool?: number;

  @Column("varchar", { length: 90, nullable: true })
  public KyuuyouRiyuu?: string;

  @Column("float", { nullable: true })
  public Rating?: number;

  @Column("float", { nullable: true })
  public Idm?: number;

  @Column("float", { nullable: true })
  public KishuShisuu?: number;

  @Column("float", { nullable: true })
  public JouhouShisuu?: number;

  @Column("float", { nullable: true })
  public SougouShisuu?: number;

  @Column("smallint", { nullable: true })
  public NinkiShisuu?: number;

  @Column("float", { nullable: true })
  public ChoukyouShisuu?: number;

  @Column("float", { nullable: true })
  public KyuushaShisuu?: number;

  @Column("smallint", { nullable: true })
  public KyuushaHyouka?: number;

  @Column("smallint", { nullable: true })
  public Kyakushitsu: number;

  @Column("smallint", { nullable: true })
  public KyoriTekisei: number;

  @Column("smallint", { nullable: true })
  public KyoriTekisei2: number;

  @Column("smallint", { nullable: true })
  public Joushoudo: number;

  @Column("smallint", { nullable: true })
  public Rotation: number;

  @Column("smallint", { nullable: true })
  public YosouTenkai?: number;

  @Column("text", { nullable: true })
  public KishuKyuushaComment: string;

  @Column("float", { nullable: true })
  public KishuKitaiRentairitsu: number;

  @Column("smallint", { nullable: true })
  public GekisouShisuu: number;

  @Column("smallint", { nullable: true })
  public HidumeCode: number;

  @Column("smallint", { nullable: true })
  public OmoTekisei: number;

  @Column("smallint", { nullable: true })
  public ClassCode: number;

  @Column("text", { nullable: true })
  public JisouhenoMemo: string;

  @Column("bigint", { nullable: true })
  public KakutokuShoukin: number;

  @Column("int", { nullable: true })
  public ShuutokuShoukin: number;

  @Column("smallint", { nullable: true })
  public JoukenClass: number;

  @Column("float", { nullable: true })
  public TenShisuu: number;

  @Column("float", { nullable: true })
  public PaceShisuu: number;

  @Column("float", { nullable: true })
  public AgariShisuu: number;

  @Column("float", { nullable: true })
  public IchiShisuu: number;

  @Column("smallint", { nullable: true })
  public PaceYosou: number;

  @Column("smallint", { nullable: true })
  public DouchuuJuni: number;

  @Column("float", { nullable: true })
  public DouchuuSa: number;

  @Column("smallint", { nullable: true })
  public DouchuuUchiSoto: number;

  @Column("smallint", { nullable: true })
  public Agari3FJuni: number;

  @Column("float", { nullable: true })
  public Agari3FSa: number;

  @Column("smallint", { nullable: true })
  public Agari3FUchiSoto: number;

  @Column("smallint", { nullable: true })
  public GoalJuni: number;

  @Column("float", { nullable: true })
  public GoalSa: number;

  @Column("smallint", { nullable: true })
  public GoalUchiSoto: number;

  @Column("float", { nullable: true })
  public TenkaiCode: number;

  @Column("smallint", { nullable: true })
  public GekisouJuni: number;

  @Column("smallint", { nullable: true })
  public LsShisuuJuni: number;

  @Column("smallint", { nullable: true })
  public TenShisuuJuni: number;

  @Column("smallint", { nullable: true })
  public PaceShisuuJuni: number;

  @Column("smallint", { nullable: true })
  public AgariShisuuJuni: number;

  @Column("smallint", { nullable: true })
  public IchiShisuuJuni: number;

  @Column("float", { nullable: true })
  public KishuKitaiTanshouRitsu: number;

  @Column("float", { nullable: true })
  public KishuKitai3ChakunaiRitsu: number;

  @Column("smallint", { nullable: true })
  public YosouKubun: number;

  @Column("bigint", { nullable: true })
  public KolShutsubahyouSakuseiNengappi?: number;

  @Column("bigint", { nullable: true })
  public KolSeisekiSakuseiNengappi?: number;

  @Column("smallint", { nullable: true })
  public SouhouZentai: number;

  @Column("smallint", { nullable: true })
  public SouhouAshidukai: number;

  @Column("smallint", { nullable: true })
  public SouhouKaiten: number;

  @Column("smallint", { nullable: true })
  public SouhouHohaba: number;

  @Column("smallint", { nullable: true })
  public SouhouAshiage: number;

  @Column("smallint", { nullable: true })
  public TaikeiZentai: number;

  @Column("smallint", { nullable: true })
  public TaikeiSenaka: number;

  @Column("smallint", { nullable: true })
  public TaikeiDou: number;

  @Column("smallint", { nullable: true })
  public TaikeiShiri: number;

  @Column("smallint", { nullable: true })
  public TaikeiTomo: number;

  @Column("smallint", { nullable: true })
  public TaikeiHarabukuro: number;

  @Column("smallint", { nullable: true })
  public TaikeiAtama: number;

  @Column("smallint", { nullable: true })
  public TaikeiKubi: number;

  @Column("smallint", { nullable: true })
  public TaikeiMune: number;

  @Column("smallint", { nullable: true })
  public TaikeiKata: number;

  @Column("smallint", { nullable: true })
  public TaikeiMaeNagasa: number;

  @Column("smallint", { nullable: true })
  public TaikeiUshiroNagasa: number;

  @Column("smallint", { nullable: true })
  public TaikeiMaeHaba: number;

  @Column("smallint", { nullable: true })
  public TaikeiUshiroHaba: number;

  @Column("smallint", { nullable: true })
  public TaikeiMaeTsunagari: number;

  @Column("smallint", { nullable: true })
  public TaikeiUshiroTsunagari: number;

  @Column("smallint", { nullable: true })
  public TaikeiO: number;

  @Column("smallint", { nullable: true })
  public TaikeiFuri: number;

  @Column("smallint", { nullable: true })
  public TaikeiSougou1: number;

  @Column("smallint", { nullable: true })
  public TaikeiSougou2: number;

  @Column("smallint", { nullable: true })
  public TaikeiSougou3: number;

  @Column("smallint", { nullable: true })
  public Tokki1: number;

  @Column("smallint", { nullable: true })
  public Tokki2: number;

  @Column("smallint", { nullable: true })
  public Tokki3: number;
 
  @Column("float", { nullable: true })
  public StartShisuu: number;
 
  @Column("float", { nullable: true })
  public DeokureRitsu: number;
 
  @Column("smallint", { nullable: true })
  public MankenShisuu: number;
 
  @Column("smallint", { nullable: true })
  public MankenShirushi: number;
}