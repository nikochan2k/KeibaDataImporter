import {
  Entity, Index, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn,
  OneToMany
} from "typeorm";
import { Kyuusha } from "./Kyuusha";
import { Banushi } from "./Banushi";
import { Seisansha } from "./Seisansha";
import { Shussouba } from "./Shussouba";
import { Record } from "./Record";

@Entity("Uma")
@Index("IxUma", (u: Uma) => [u.KanaBamei])
export class Uma {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("string", { length: 45 })
  public KanaBamei: string;

  @Column("string", { length: 60, nullable: true })
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

  @OneToMany(() => Uma, Uma => Uma.ChichiUma)
  public Children: Uma[];

  @Column("int", { name: "ChichiUmaId", nullable: true })
  @ManyToOne(() => Uma, Uma => Uma.Children)
  @JoinColumn({ name: "ChichiUmaId" })
  public ChichiUma?: Uma;

  @Column("int", { name: "HahaUmaId", nullable: true })
  @ManyToOne(() => Uma, Uma => Uma.Children)
  @JoinColumn({ name: "HahaUmaId" })
  public HahaUma?: Uma;

  @Column("int", { name: "BanushiId", nullable: true })
  @ManyToOne(() => Banushi, Banushi => Banushi.UmaList)
  @JoinColumn({ name: "BanushiId" })
  public Banushi?: Banushi;

  @Column("int", { name: "SeisanshaId", nullable: true })
  @ManyToOne(() => Seisansha, Seisansha => Seisansha.UmaList)
  @JoinColumn({ name: "SeisanshaId" })
  public Seisansha?: Seisansha;

  @Column("int", { name: "KyuushaId", nullable: true })
  @ManyToOne(() => Kyuusha, Kyuusha => Kyuusha.KyousoubaList)
  @JoinColumn({ name: "KyuushaId" })
  public Kyuusha?: Kyuusha;

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
  public YunyuubaFlag?: number;

  @Column("smallint", { nullable: true })
  public SibouNen?: number;

  @Column("date", { nullable: true })
  public DataSakuseiNengappi: Date;

  @OneToMany(() => Shussouba, s => s.Kyousouba)
  public ShussoubaList: Shussouba[];

  @OneToMany(() => Record, r => r.Kyousouba)
  public RecordList: Record[];
}
