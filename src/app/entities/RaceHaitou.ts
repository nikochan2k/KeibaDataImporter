import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
  } from "typeorm";
import { Race } from "./Race";

@Entity("RaceHaitou")
@Index("IxRaceHaitou", (rh: RaceHaitou) => [rh.Race, rh.Baken])
export class RaceHaitou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint", { name: "RaceId" })
  @ManyToOne(() => Race, r => r.RaceHaitouList)
  @JoinColumn({ name: "RaceId" })
  public Race: Race;

  @Column("smallint")
  public Baken: number;

  @Column("smallint")
  public Bangou1: number;

  @Column("smallint", { nullable: true })
  public Bangou2?: number;

  @Column("smallint", { nullable: true })
  public Bangou3?: number;

  @Column("int")
  public Haitoukin: number;

  @Column("smallint", { nullable: true })
  public Ninki?: number;
}