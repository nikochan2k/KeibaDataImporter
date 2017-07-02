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

  @Column("smallint")
  public Kaiji: number;

  @Column("smallint")
  public Nichiji: number;

  @Column("smallint")
  public RaceBangou: number;

  @Column("bigint")
  public Nengappi: number;

  @Column("smallint", { nullable: true })
  public Kyuujitsu?: number;

  @Column("smallint")
  public Youbi: number;

  @Column("smallint", { nullable: true })
  public JuushouKaisuu?: number;

  @Column("int")
  public RaceClassId: number;

  @Column("int")
  public JoukenFuka: number;

  @Column("smallint", { nullable: true })
  public BetteiBareiHandi?: number;

  @Column("varchar", { nullable: true, length: 27 })
  public BetteiBareiHandiReigai: string;

  @Column("smallint", { nullable: true })
  public JoukenNenreiSeigen?: number;

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
  public BabaShousai?: number; // 0:普通 1:速い 2:遅い

  @Column("smallint", { nullable: true })
  public Seed?: number;

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
