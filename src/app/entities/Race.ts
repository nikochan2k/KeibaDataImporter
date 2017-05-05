import {
  Entity, Index, Column, PrimaryColumn, OneToOne, OneToMany
} from "typeorm";
import { RaceFuka } from "./RaceFuka";
import { RaceYosouTenkai } from "./RaceYosouTenkai";
import { RaceShoukin } from "./RaceShoukin";
import { RaceLapTime } from "./RaceLapTime";
import { RaceHaitou } from "./RaceHaitou";
import { RaceHassouJoukyou } from "./RaceHassouJoukyou";
import { RaceKeika } from "./RaceKeika";
import { OddsKubun } from "./OddsKubun";
import { Shussouba } from "./Shussouba";

@Entity("Race")
@Index("IxRace", (r: Race) => [r.Nengappi, r.KaisaiBasho, r.RaceBangou])
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

  @Column("smallint", { nullable: true })
  public Kyuujitsu?: number;

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
  public BabaShousai?: number; // 0:普通 1:速い 2:遅い

  @Column("smallint", { nullable: true })
  public Seed?: number;

  @Column("float", { nullable: true })
  public ShougaiHeikin1F?: number;

  @Column("date", { nullable: true })
  public ShutsubahyouSakuseiNengappi?: Date;

  @Column("date", { nullable: true })
  public SeisekiSakuseiNengappi?: Date;

  @OneToOne(() => RaceFuka, rf => rf.Race)
  public RaceFuka: RaceFuka;

  @OneToMany(() => RaceYosouTenkai, ryt => ryt.Race)
  public RaceYosouTenkaiList: RaceYosouTenkai[];

  @OneToMany(() => RaceShoukin, rs => rs.Race)
  public RaceShoukinList: RaceShoukin[];

  @OneToMany(() => RaceLapTime, rlt => rlt.Race)
  public RaceLapTimeList: RaceLapTime[];

  @OneToMany(() => RaceHaitou, rh => rh.Race)
  public RaceHaitouList: RaceHaitou[];

  @OneToMany(() => RaceHassouJoukyou, rhj => rhj.Race)
  public RaceHassouJoukyouList: RaceHassouJoukyou[];

  @OneToMany(() => RaceKeika, rk => rk.Race)
  public RaceKeikaList: RaceKeika[];

  @OneToMany(() => OddsKubun, ok => ok.Race)
  public OddsKubunList: OddsKubun[];

  @OneToMany(() => Shussouba, s => s.Race)
  public ShussoubaList: Shussouba[];
}
