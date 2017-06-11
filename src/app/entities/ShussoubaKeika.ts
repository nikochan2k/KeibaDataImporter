import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
  } from "typeorm";
import { RaceKeika } from "./RaceKeika";
import { Shussouba } from "./Shussouba";

@Entity("ShussoubaKeika")
@Index("IxShussoubaKeika", (sk: ShussoubaKeika) => [sk.RaceKeika, sk.Shussouba])
export class ShussoubaKeika {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint", { name: "RaceKeikaId" })
  @ManyToOne(() => RaceKeika, rk => rk.ShussoubaKeikaList)
  @JoinColumn({ name: "RaceKeikaId" })
  public RaceKeika: RaceKeika;

  @Column("bigint", { name: "ShussoubaId" })
  @ManyToOne(() => Shussouba, s => s.ShussoubaKeikaList)
  @JoinColumn({ name: "ShussoubaId" })
  public Shussouba: Shussouba;

  @Column("smallint")
  public TateCount: number;

  @Column("smallint")
  public TateHanareteCount: number;

  @Column("smallint")
  public TateOokikuHanareteCount: number;

  @Column("smallint")
  public YokoCount: number;
}