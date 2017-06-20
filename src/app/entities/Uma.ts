import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
  } from "typeorm";
import { Kyousouba } from "./Kyousouba";
import { Seisansha } from "./Seisansha";

@Entity("Uma")
@Index("IxUma", (u: Uma) => [u.Bamei])
export class Uma {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("varchar", { length: 54 })
  public Bamei: string;

  @Column("date", { nullable: true })
  public Seinengappi?: Date;

  @Column("smallint", { nullable: true })
  public Keiro?: number;

  @Column("smallint", { nullable: true })
  public Kesshu?: number;

  @Column("smallint", { nullable: true })
  public Sanchi?: number;

  @Column("smallint")
  public Seibetsu: number;

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

  @Column("int", { name: "SeisanshaId", nullable: true })
  @ManyToOne(() => Seisansha, Seisansha => Seisansha.UmaList)
  @JoinColumn({ name: "SeisanshaId" })
  public Seisansha?: Seisansha;

  @Column("smallint", { nullable: true })
  public MasshouFlag?: number;

  @Column("date", { nullable: true })
  public MasshouNengappi?: Date;

  @Column("varchar", { length: 9, nullable: true })
  public Jiyuu?: string;

  @Column("varchar", { length: 15, nullable: true })
  public Ikisaki?: string;

  @Column("smallint", { nullable: true })
  public YunyuubaFlag?: number;

  @Column("smallint", { nullable: true })
  public ShibouNen?: number;

  @OneToMany(() => Kyousouba, k => k.Uma)
  public KyousoubaList: Kyousouba[];
}
