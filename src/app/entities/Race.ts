import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("Race")
@Index("IxRace", (r: Race) => [r.Nengappi, r.Basho, r.RaceBangou])
export class Race {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("smallint")
  public Basho: number;

  @Column("smallint", { nullable: true })
  public Kaiji?: number;

  @Column("smallint", { nullable: true })
  public Nichiji?: number;

  @Column("smallint")
  public RaceBangou: number;

  @Column("bigint")
  public Nengappi: number;

  @Column("smallint", { nullable: true })
  public Kyuujitsu?: number;

  @Column("smallint")
  public Youbi: number;

  @Column("smallint", { nullable: true })
  public ChuuouChihouGaikoku?: number;

  @Column("smallint")
  public IppanTokubetsu: number;

  @Column("smallint")
  public HeichiShougai: number;

  @Column("smallint", { nullable: true })
  public JuushouKaisuu?: number;

  @Column("varchar", { nullable: true, length: 45 })
  public TokubetsuMei?: string;

  @Column("smallint", { nullable: true })
  public Grade?: number;

  @Column("varchar", { nullable: true, length: 21 })
  public TanshukuTokubetsuMei?: string;

  @Column("int")
  public JoukenFuka: number;

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

  @Column("smallint", { nullable: true })
  public Tenki?: number;

  @Column("smallint", { nullable: true })
  public Baba?: number;

  @Column("smallint", { nullable: true })
  public BabaShousai?: number; // 0:普通 1:速い 2:遅い

  @Column("varchar", { nullable: true, length: 30 })
  public GaikokuKeibajouMei: string;

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
  public FukaShou?: number;

  @Column("text", { nullable: true })
  public SeisaiNaiyou?: string;

  @Column("bigint", { nullable: true })
  public KolShutsubahyouSakuseiNengappi?: number;

  @Column("bigint", { nullable: true })
  public KolSeisekiSakuseiNengappi?: number;

  @Column("bigint", { nullable: true })
  public JrdbShutsubahyouSakuseiNengappi?: number;

  @Column("bigint", { nullable: true })
  public JrdbSeisekiSakuseiNengappi?: number;

  @Column("float", { nullable: true })
  public SuiteiTimeRyou?: number;

  @Column("float", { nullable: true })
  public SuiteiTimeOmoFuryou?: number;

  @Column("smallint", { nullable: true })
  public YosouPace?: number;

  @Column("varchar", { nullable: true, length: 18 })
  public Yosoushamei2: string;
}
