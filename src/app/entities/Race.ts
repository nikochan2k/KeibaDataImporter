import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("Race")
@Index("IxRace", (r: Race) => [r.KaisaiId, r.RaceBangou])
export class Race {
  @PrimaryColumn("int")
  public Id: number;

  @Column("int")
  public KaisaiId: number;

  @Column("tinyint")
  public RaceBangou: number;

  @Column("tinyint", { nullable: true })
  public IppanTokubetsu: number;

  @Column("tinyint", { nullable: true })
  public HeichiShougai: number;

  @Column("tinyint", { nullable: true })
  public Grade?: number;

  @Column("tinyint", { nullable: true })
  public JpnFlag?: number;

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

  @Column("tinyint", { nullable: true })
  public BetteiBareiHandi?: number;

  @Column("varchar", { nullable: true, length: 27 })
  public BetteiBareiHandiReigai: string;

  @Column("tinyint", { nullable: true })
  public JoukenNenreiSeigen?: number;

  @Column("smallint", { nullable: true })
  public Jouken1?: number;

  @Column("tinyint", { nullable: true })
  public Kumi1?: number;

  @Column("tinyint", { nullable: true })
  public IjouIkaMiman?: number;

  @Column("smallint", { nullable: true })
  public Jouken2?: number;

  @Column("tinyint", { nullable: true })
  public Kumi2?: number;

  @Column("tinyint", { nullable: true })
  public DirtShiba: number;

  @Column("tinyint", { nullable: true })
  public MigiHidari: number;

  @Column("tinyint", { nullable: true })
  public UchiSoto?: number;

  @Column("tinyint", { nullable: true })
  public Course?: number;

  @Column("smallint", { nullable: true })
  public Kyori: number;

  @Column("tinyint", { nullable: true })
  public MaeuriFlag?: number;

  @Column("varchar", { nullable: true, length: 5 })
  public YoteiHassouJikan: string;

  @Column("tinyint", { nullable: true })
  public Tousuu?: number;

  @Column("tinyint", { nullable: true })
  public TorikeshiTousuu?: number;

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
  public SannyuShoukin1Chaku: number;

  @Column("int", { nullable: true })
  public SannyuShoukin2Chaku: number;

  @Column("int", { nullable: true })
  public FukaShou?: number;

  @Column("float", { nullable: true })
  public SuiteiTimeRyou?: number;

  @Column("float", { nullable: true })
  public SuiteiTimeOmoFuryou?: number;

  @Column("smallint", { nullable: true })
  public YosouPace?: number;

  @Column("varchar", { nullable: true, length: 18 })
  public Yosoushamei2: string;

  @Column("int", { nullable: true })
  public KolDenNengappi: number;

  @Column("int", { nullable: true })
  public KolSeiNengappi: number;

  @Column("int", { nullable: true })
  public JrdbNengappi: number;
}
