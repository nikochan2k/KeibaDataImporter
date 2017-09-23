import {
  Column,
  Entity,
  PrimaryColumn
} from "typeorm";

@Entity("ShussoubaJrdb")
export class ShussoubaJrdb {
  @PrimaryColumn("bigint")
  public Id: number;


  @Column("real", { nullable: true })
  public Idm?: number;

  @Column("real", { nullable: true })
  public KishuShisuu?: number;

  @Column("real", { nullable: true })
  public JouhouShisuu?: number;

  @Column("real", { nullable: true })
  public SougouShisuu?: number;


  @Column("smallint", { nullable: true })
  public Kyakushitsu: number;

  @Column("smallint", { nullable: true })
  public KyoriTekisei: number;

  @Column("smallint", { nullable: true })
  public Joushoudo: number;

  @Column("smallint", { nullable: true })
  public Rotation: number;


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
  public NinkiShisuu?: number;

  @Column("real", { nullable: true })
  public ChoukyouShisuu?: number;

  @Column("real", { nullable: true })
  public KyuushaShisuu?: number;


  @Column("smallint", { nullable: true })
  public ChoukyouYajirushi?: number;

  @Column("smallint", { nullable: true })
  public KyuushaHyouka?: number;

  @Column("real", { nullable: true })
  public KishuKitaiRentairitsu: number;

  @Column("smallint", { nullable: true })
  public GekisouShisuu: number;

  @Column("smallint", { nullable: true })
  public HidumeCode: number;

  @Column("smallint", { nullable: true })
  public OmoTekisei: number;

  @Column("smallint", { nullable: true })
  public ClassCode: number;


  // 印

  @Column("smallint", { nullable: true })
  public SougouShirushi?: number;

  @Column("smallint", { nullable: true })
  public IdmShirushi?: number;

  @Column("smallint", { nullable: true })
  public JouhouShirushi?: number;

  @Column("smallint", { nullable: true })
  public KishuShirushi?: number;

  @Column("smallint", { nullable: true })
  public KyuushaShirushi?: number;

  @Column("smallint", { nullable: true })
  public ChoukyouShirushi?: number;

  @Column("smallint", { nullable: true })
  public GekisouShirushi?: number;


  @Column("smallint", { nullable: true })
  public ShibaTekisei?: number;

  @Column("smallint", { nullable: true })
  public DirtTekisei?: number;


  // 賞金情報

  @Column("bigint", { nullable: true })
  public KakutokuShoukin: number;

  @Column("int", { nullable: true })
  public ShuutokuShoukin: number;

  @Column("smallint", { nullable: true })
  public JoukenClass: number;


  // 展開予想

  @Column("real", { nullable: true })
  public TenShisuu: number;

  @Column("real", { nullable: true })
  public PaceShisuu: number;

  @Column("real", { nullable: true })
  public AgariShisuu: number;

  @Column("real", { nullable: true })
  public IchiShisuu: number;

  @Column("smallint", { nullable: true })
  public PaceYosou: number;

  @Column("smallint", { nullable: true })
  public DouchuuJuni: number;

  @Column("real", { nullable: true })
  public DouchuuSa: number;

  @Column("smallint", { nullable: true })
  public DouchuuUchiSoto: number;

  @Column("smallint", { nullable: true })
  public Agari3FJuni: number;

  @Column("real", { nullable: true })
  public Agari3FSa: number;

  @Column("smallint", { nullable: true })
  public Agari3FUchiSoto: number;

  @Column("smallint", { nullable: true })
  public GoalJuni: number;

  @Column("real", { nullable: true })
  public GoalSa: number;

  @Column("smallint", { nullable: true })
  public GoalUchiSoto: number;

  @Column("smallint", { nullable: true })
  public TenkaiKigou: number;


  @Column("smallint", { nullable: true })
  public KyoriTekisei2: number;


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


  @Column("real", { nullable: true })
  public KishuKitaiTanshouRitsu: number;

  @Column("real", { nullable: true })
  public KishuKitai3ChakunaiRitsu: number;

  @Column("smallint", { nullable: true })
  public YosouKubun: number;


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

  @Column("real", { nullable: true })
  public StartShisuu: number;

  @Column("real", { nullable: true })
  public DeokureRitsu: number;

  @Column("smallint", { nullable: true })
  public MankenShisuu: number;

  @Column("smallint", { nullable: true })
  public MankenShirushi: number;


  @Column("tinyint", { nullable: true })
  public KoukyuuFlag?: number;

  @Column("tinyint", { nullable: true })
  public GekisouType?: number;


  @Column("tinyint", { nullable: true })
  public ShibaDirtShougaiFlag?: number;

  @Column("tinyint", { nullable: true })
  public KyoriFlag?: number;

  @Column("tinyint", { nullable: true })
  public ClassFlag?: number;

  @Column("tinyint", { nullable: true })
  public TenkyuuFlag?: number;

  @Column("tinyint", { nullable: true })
  public KyoseiFlag?: number;

  @Column("tinyint", { nullable: true })
  public NorikawariFlag?: number;


  @Column("tinyint", { nullable: true })
  public NyuukyuuNansoume?: number;

  @Column("int", { nullable: true })
  public NyuukyuuNengappi?: number;

  @Column("smallint", { nullable: true })
  public NyuukyuuNannichimae?: number;


  @Column("varchar", { length: 75, nullable: true })
  public Houbokusaki?: string;

  @Column("tinyint", { nullable: true })
  public HoubokusakiRank?: number;

  @Column("tinyint", { nullable: true })
  public KyuushaRank?: number;

  @Column("real", { nullable: true })
  public CidChoukyouSoten: number;

  @Column("real", { nullable: true })
  public CidKyuushaSoten: number;

  @Column("real", { nullable: true })
  public CidSoten: number;

  @Column("smallint", { nullable: true })
  public Cid: number;


  @Column("real", { nullable: true })
  public LsShisuu: number;

  @Column("tinyint", { nullable: true })
  public LsHyouka: number;

  @Column("tinyint", { nullable: true })
  public Em: number;

  @Column("tinyint", { nullable: true })
  public KyuushaBbShirushi: number;

  @Column("tinyint", { nullable: true })
  public KishuBbShirushi: number;

}