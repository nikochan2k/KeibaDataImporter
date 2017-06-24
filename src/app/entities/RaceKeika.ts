import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn
  } from "typeorm";
import { Race } from "./Race";
import { ShussoubaKeika } from "./ShussoubaKeika";

@Entity("RaceKeika")
@Index("IxRaceKeika", (rk: RaceKeika) => [rk.Race])
export class RaceKeika {
  @PrimaryColumn("bigint")
  public Id: number;

  @ManyToOne(() => Race, Race => Race.RaceKeikaList)
  @JoinColumn({ name: "RaceId" })
  public Race: Race;

  @Column("varchar", { length: 165 })
  public Keika: string;

  @Column("smallint", { nullable: true })
  public Midashi1?: number;

  @Column("smallint", { nullable: true })
  public Midashi2?: number;

  @OneToMany(() => ShussoubaKeika, sk => sk.RaceKeika)
  public ShussoubaKeikaList: ShussoubaKeika[];
}
