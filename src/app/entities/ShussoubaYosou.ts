import {
  Column,
  Entity,
  PrimaryColumn
} from "typeorm";

@Entity("ShussoubaYosou")
export class ShussoubaYosou {
  @PrimaryColumn("bigint")
  public Id: number;


  @Column("tinyint", { nullable: true })
  public KolYosou1?: number;

  @Column("tinyint", { nullable: true })
  public KolYosou2?: number;

  @Column("real", { nullable: true })
  public Rating?: number;


  @Column("real", { nullable: true })
  public Idm?: number;

  @Column("real", { nullable: true })
  public KishuShisuu?: number;

  @Column("real", { nullable: true })
  public JouhouShisuu?: number;

  @Column("real", { nullable: true })
  public OddsShisuu?: number;

  @Column("real", { nullable: true })
  public PaddockShisuu?: number;

  @Column("real", { nullable: true })
  public SougouShisuu?: number;


  @Column("tinyint", { nullable: true })
  public BaguHenkouJouhou: number;

  @Column("tinyint", { nullable: true })
  public Ashimoto: number;


  @Column("tinyint", { nullable: true })
  public Kyakushitsu: number; // Jrdb優先

  @Column("tinyint", { nullable: true })
  public KyoriTekisei: number;

  @Column("tinyint", { nullable: true })
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


  @Column("tinyint", { nullable: true })
  public ChoukyouYajirushi?: number;

  @Column("tinyint", { nullable: true })
  public KyuushaHyouka?: number;

  @Column("real", { nullable: true })
  public KishuKitaiRentairitsu: number;

  @Column("smallint", { nullable: true })
  public GekisouShisuu: number;

  @Column("tinyint", { nullable: true })
  public HidumeCode: number;

  @Column("tinyint", { nullable: true })
  public OmoTekisei: number;

  @Column("tinyint", { nullable: true })
  public ClassCode: number;


  // 印

  @Column("tinyint", { nullable: true })
  public SougouShirushi?: number;

  @Column("tinyint", { nullable: true })
  public IdmShirushi?: number;

  @Column("tinyint", { nullable: true })
  public JouhouShirushi?: number;

  @Column("tinyint", { nullable: true })
  public KishuShirushi?: number;

  @Column("tinyint", { nullable: true })
  public KyuushaShirushi?: number;

  @Column("tinyint", { nullable: true })
  public ChoukyouShirushi?: number;

  @Column("tinyint", { nullable: true })
  public GekisouShirushi?: number;

  @Column("tinyint", { nullable: true })
  public OddsShirushi?: number;

  @Column("tinyint", { nullable: true })
  public PaddockShirushi?: number;

  @Column("tinyint", { nullable: true })
  public ChokuzenSougouShirushi?: number;

  @Column("tinyint", { nullable: true })
  public ShibaTekisei?: number;

  @Column("tinyint", { nullable: true })
  public DirtTekisei?: number;


  // 賞金情報

  @Column("bigint", { nullable: true })
  public KakutokuShoukin: number;

  @Column("int", { nullable: true })
  public ShuutokuShoukin: number;

  @Column("tinyint", { nullable: true })
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

  @Column("tinyint", { nullable: true })
  public PaceYosou: number;

  @Column("tinyint", { nullable: true })
  public DouchuuJuni: number;

  @Column("real", { nullable: true })
  public DouchuuSa: number;

  @Column("tinyint", { nullable: true })
  public DouchuuUchiSoto: number;

  @Column("tinyint", { nullable: true })
  public Agari3FJuni: number;

  @Column("real", { nullable: true })
  public Agari3FSa: number;

  @Column("tinyint", { nullable: true })
  public Agari3FUchiSoto: number;

  @Column("tinyint", { nullable: true })
  public GoalJuni: number;

  @Column("real", { nullable: true })
  public GoalSa: number;

  @Column("tinyint", { nullable: true })
  public GoalUchiSoto: number;

  @Column("tinyint", { nullable: true })
  public TenkaiKigou: number;


  @Column("tinyint", { nullable: true })
  public KyoriTekisei2: number;


  @Column("tinyint", { nullable: true })
  public GekisouJuni: number;

  @Column("tinyint", { nullable: true })
  public LsShisuuJuni: number;

  @Column("tinyint", { nullable: true })
  public TenShisuuJuni: number;

  @Column("tinyint", { nullable: true })
  public PaceShisuuJuni: number;

  @Column("tinyint", { nullable: true })
  public AgariShisuuJuni: number;

  @Column("tinyint", { nullable: true })
  public IchiShisuuJuni: number;


  @Column("real", { nullable: true })
  public KishuKitaiTanshouRitsu: number;

  @Column("real", { nullable: true })
  public KishuKitai3ChakunaiRitsu: number;

  @Column("tinyint", { nullable: true })
  public YosouKubun: number;


  @Column("tinyint", { nullable: true })
  public SouhouZentai: number;

  @Column("tinyint", { nullable: true })
  public SouhouAshidukai: number;

  @Column("tinyint", { nullable: true })
  public SouhouKaiten: number;

  @Column("tinyint", { nullable: true })
  public SouhouHohaba: number;

  @Column("tinyint", { nullable: true })
  public SouhouAshiage: number;

  @Column("tinyint", { nullable: true })
  public TaikeiZentai: number;

  @Column("tinyint", { nullable: true })
  public TaikeiSenaka: number;

  @Column("tinyint", { nullable: true })
  public TaikeiDou: number;

  @Column("tinyint", { nullable: true })
  public TaikeiShiri: number;

  @Column("tinyint", { nullable: true })
  public TaikeiTomo: number;

  @Column("tinyint", { nullable: true })
  public TaikeiHarabukuro: number;

  @Column("tinyint", { nullable: true })
  public TaikeiAtama: number;

  @Column("tinyint", { nullable: true })
  public TaikeiKubi: number;

  @Column("tinyint", { nullable: true })
  public TaikeiMune: number;

  @Column("tinyint", { nullable: true })
  public TaikeiKata: number;

  @Column("tinyint", { nullable: true })
  public TaikeiMaeNagasa: number;

  @Column("tinyint", { nullable: true })
  public TaikeiUshiroNagasa: number;

  @Column("tinyint", { nullable: true })
  public TaikeiMaeHaba: number;

  @Column("tinyint", { nullable: true })
  public TaikeiUshiroHaba: number;

  @Column("tinyint", { nullable: true })
  public TaikeiMaeTsunagari: number;

  @Column("tinyint", { nullable: true })
  public TaikeiUshiroTsunagari: number;

  @Column("tinyint", { nullable: true })
  public TaikeiO: number;

  @Column("tinyint", { nullable: true })
  public TaikeiFuri: number;

  @Column("real", { nullable: true })
  public StartShisuu: number;

  @Column("real", { nullable: true })
  public DeokureRitsu: number;

  @Column("smallint", { nullable: true })
  public MankenShisuu: number;

  @Column("tinyint", { nullable: true })
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


  @Column("mediumint", { nullable: true })
  public HoubokusakiId?: number;

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