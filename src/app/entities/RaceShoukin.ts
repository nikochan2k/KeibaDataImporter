import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
  } from "typeorm";
import { Race } from "./Race";

@Entity("RaceShoukin")
@Index("IxRaceShoukin", (rs: RaceShoukin) => [rs.Race])
export class RaceShoukin {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint", { name: "RaceId" })
  @ManyToOne(() => Race, r => r.RaceShoukinList)
  @JoinColumn({ name: "RaceId" })
  public Race: Race;

  @Column("smallint")
  public Kakutei: number;

  @Column("smallint")
  public Chakujun: number;

  @Column("int")
  public Shoukin: number;

  @Column("smallint")
  public Fukashou: number;
}