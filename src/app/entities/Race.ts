import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("Race")
@Index("IxRace", (r: Race) => [r.KaisaiId, r.RaceBangou])
export class Race {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("int")
  public KaisaiId: number;

  @Column("smallint")
  public RaceBangou: number;

  @Column("bigint", { nullable: true })
  public Nengappi: number;

  @Column("smallint", { nullable: true })
  public IppanTokubetsu: number;

  @Column("smallint", { nullable: true })
  public HeichiShougai: number;

  @Column("tinyint", { nullable: true })
  public Grade?: number;

  @Column("tinyint", { nullable: true })
  public JpnFlag?: number;

  @Column("varchar", { nullable: true, length: 27 })
  public RaceMei?: string;

  @Column("varchar", { nullable: true, length: 75 })
  public TokubetsuMei?: string;

  @Column("varchar", { nullable: true, length: 12 })
  public TanshukuTokubetsuMei?: string;

  @Column("smallint", { nullable: true })
  public JuushouKaisuu?: number;

  @Column("tinyint", { nullable: true })
  public JoukenSarakei: number;

  @Column("tinyint", { nullable: true })
  public JoukenAraKei: number;

  @Column("tinyint", { nullable: true })
  public JoukenBoba: number;

  @Column("tinyint", { nullable: true })
  public JoukenHinba: number;

  @Column("tinyint", { nullable: true })
  public JoukenSenba: number;

  @Column("tinyint", { nullable: true })
  public JoukenMaruKon: number;

  @Column("tinyint", { nullable: true })
  public JoukenMaruChichi: number;

  @Column("tinyint", { nullable: true })
  public JoukenMaruIchi: number;

  @Column("tinyint", { nullable: true })
  public JoukenMaruChuu: number;

  @Column("tinyint", { nullable: true })
  public JoukenKakuChuu: number;

  @Column("tinyint", { nullable: true })
  public JoukenMaruKokusai: number;

  @Column("tinyint", { nullable: true })
  public JoukenMaruShou: number;

  @Column("tinyint", { nullable: true })
  public JoukenMaruShi: number;

  @Column("tinyint", { nullable: true })
  public JoukenMaruTokuShi: number;

  @Column("tinyint", { nullable: true })
  public JoukenKakuShi: number;

  @Column("tinyint", { nullable: true })
  public JoukenShounyuu: number;

  @Column("tinyint", { nullable: true })
  public JoukenNaikokusan: number;

  @Column("tinyint", { nullable: true })
  public JoukenKouryuu: number;

  @Column("tinyint", { nullable: true })
  public JoukenWakate: number;

  @Column("tinyint", { nullable: true })
  public JoukenKyuushuusan: number;

  @Column("tinyint", { nullable: true })
  public JoukenChibasan: number;

  @Column("tinyint", { nullable: true })
  public JoukenKansaiHaifuba: number;

  @Column("tinyint", { nullable: true })
  public JoukenKantouHaifuba: number;

  @Column("tinyint", { nullable: true })
  public JoukenJraNintei: number;

  @Column("tinyint", { nullable: true })
  public JoukenJraShitei: number;

  @Column("tinyint", { nullable: true })
  public JoukenAshige: number;

  @Column("tinyint", { nullable: true })
  public JoukenKurige: number;

  @Column("tinyint", { nullable: true })
  public JoukenAshigeShiroge: number;

  @Column("tinyint", { nullable: true })
  public JoukenKurokage: number;

  @Column("tinyint", { nullable: true })
  public JoukenSeed: number;

  @Column("smallint", { nullable: true })
  public BetteiBareiHandi?: number;

  @Column("varchar", { nullable: true, length: 27 })
  public BetteiBareiHandiReigai: string;

  @Column("smallint", { nullable: true })
  public JoukenNenreiSeigen?: number;

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

  @Column("smallint", { nullable: true })
  public DirtShiba: number;

  @Column("smallint", { nullable: true })
  public MigiHidari: number;

  @Column("smallint", { nullable: true })
  public UchiSoto?: number;

  @Column("smallint", { nullable: true })
  public Course?: number;

  @Column("smallint", { nullable: true })
  public Kyori: number;

  @Column("smallint", { nullable: true })
  public MaeuriFlag?: number;

  @Column("varchar", { nullable: true, length: 5 })
  public YoteiHassouJikan: string;

  @Column("smallint", { nullable: true })
  public Tousuu?: number;

  @Column("smallint", { nullable: true })
  public TorikeshiTousuu?: number;

  @Column("smallint", { nullable: true })
  public Pace?: number;

  @Column("real", { nullable: true })
  public PaceShisuu?: number;

  @Column("smallint", { nullable: true })
  public PaceUpNokoriFalon?: number;

  @Column("smallint", { nullable: true })
  public Tenki?: number;

  @Column("smallint", { nullable: true })
  public Baba?: number;

  @Column("smallint", { nullable: true })
  public BabaSokudo?: number; // 0:普通 1:速い 2:遅い

  @Column("float", { nullable: true })
  public ShougaiHeikin1F?: number;

  @Column("int", { nullable: true })
  public CourseRecordId?: number;

  @Column("int", { nullable: true })
  public KyoriRecordId?: number;

  @Column("int", { nullable: true })
  public RaceRecordId?: number;

  @Column("int", { nullable: true })
  public Shoukin1Chaku: number;

  @Column("int", { nullable: true })
  public Shoukin2Chaku: number;

  @Column("int", { nullable: true })
  public Shoukin3Chaku: number;

  @Column("int", { nullable: true })
  public Shoukin4Chaku: number;

  @Column("int", { nullable: true })
  public Shoukin5Chaku: number;

  @Column("int", { nullable: true })
  public Shoukin5ChakuDouchaku: number;

  @Column("int", { nullable: true })
  public Shoukin5ChakuDouchaku2: number;

  @Column("int", { nullable: true })
  public Shoukin1ChakuSannyuShoukin: number;

  @Column("int", { nullable: true })
  public Shoukin2ChakuSannyuShoukin: number;

  @Column("int", { nullable: true })
  public FukaShou?: number;

  @Column("text", { nullable: true })
  public SeisaiNaiyou?: string;

  @Column("text", { nullable: true })
  public RaceComment?: string;

  @Column("float", { nullable: true })
  public SuiteiTimeRyou?: number;

  @Column("float", { nullable: true })
  public SuiteiTimeOmoFuryou?: number;

  @Column("smallint", { nullable: true })
  public YosouPace?: number;

  @Column("varchar", { nullable: true, length: 18 })
  public Yosoushamei2: string;

  @Column("tinyint", { nullable: true })
  public PaceNagare?: number;

  @Column("bigint", { nullable: true })
  public KolShutsubahyouSakuseiNengappi?: number;

  @Column("bigint", { nullable: true })
  public KolSeisekiSakuseiNengappi?: number;
}
