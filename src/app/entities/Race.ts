import { OddsKubun } from "./OddsKubun";
import { RaceClass } from "./RaceClass";
import { RaceHaitou } from "./RaceHaitou";
import { RaceKeika } from "./RaceKeika";
import { RaceLapTime } from "./RaceLapTime";
import { RaceShoukin } from "./RaceShoukin";
import { Record } from "./Record";
import { Shussouba } from "./Shussouba";
import {
  Entity, Index, Column, PrimaryColumn, OneToMany, ManyToOne, JoinColumn,
} from "typeorm";

@Entity("Race")
@Index("IxRace", (r: Race) => [r.Nengappi, r.Basho, r.RaceBangou])
export class Race {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("smallint")
  public Basho: number;

  @Column("smallint")
  public Nen: number;

  @Column("smallint")
  public Kaiji: number;

  @Column("smallint")
  public Nichiji: number;

  @Column("smallint")
  public RaceBangou: number;

  @Column("date")
  public Nengappi: Date;

  @Column("smallint", { nullable: true })
  public Kyuujitsu?: number;

  @Column("smallint")
  public Youbi: number;

  @Column("smallint", { nullable: true })
  public JuushouKaisuu?: number;

  @Column("int", { name: "RaceClassId" })
  @ManyToOne(() => RaceClass, rc => rc.Id)
  @JoinColumn({ name: "RaceClassId" })
  public RaceClass: RaceClass;

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

  @Column("int", { name: "CourseRecordId", nullable: true })
  @ManyToOne(() => Record, r => r.CourseRecordList)
  @JoinColumn({ name: "CourseRecordId" })
  public CourseRecord?: Record;

  @Column("int", { name: "KyoriRecordId", nullable: true })
  @ManyToOne(() => Record, r => r.KyoriRecordList)
  @JoinColumn({ name: "KyoriRecordId" })
  public KyoriRecord?: Record;

  @Column("int", { name: "RaceRecordId", nullable: true })
  @ManyToOne(() => Record, r => r.RaceRecordList)
  @JoinColumn({ name: "RaceRecordId" })
  public RaceRecord?: Record;

  @Column("text", { nullable: true })
  public HassouJoukyou?: string;

  @Column("text", { nullable: true })
  public SeisaiNaiyou?: string;

  @Column("date", { nullable: true })
  public KolShutsubahyouSakuseiNengappi?: Date;

  @Column("date", { nullable: true })
  public KolSeisekiSakuseiNengappi?: Date;

  @Column("date", { nullable: true })
  public JrdbShutsubahyouSakuseiNengappi?: Date;

  @Column("date", { nullable: true })
  public JrdbSeisekiSakuseiNengappi?: Date;

  @Column("float", { nullable: true })
  public SuiteiTimeRyou?: number;

  @Column("float", { nullable: true })
  public SuiteiTimeOmoFuryou?: number;

  @Column("smallint", { nullable: true })
  public YosouPace?: number;

  @Column("varchar", { nullable: true, length: 18 })
  public Yosoushamei2: string;

  @OneToMany(() => RaceShoukin, rs => rs.Race)
  public RaceShoukinList: RaceShoukin[];

  @OneToMany(() => RaceLapTime, rlt => rlt.Race)
  public RaceLapTimeList: RaceLapTime[];

  @OneToMany(() => RaceHaitou, rh => rh.Race)
  public RaceHaitouList: RaceHaitou[];

  @OneToMany(() => RaceKeika, rk => rk.Race)
  public RaceKeikaList: RaceKeika[];

  @OneToMany(() => OddsKubun, ok => ok.Race)
  public OddsKubunList: OddsKubun[];

  @OneToMany(() => Shussouba, s => s.Race)
  public ShussoubaList: Shussouba[];
}
