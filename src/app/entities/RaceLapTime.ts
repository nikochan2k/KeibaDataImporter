import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
  } from "typeorm";
import { Race } from "./Race";

@Entity("RaceLapTime")
@Index("IxRaceLapTime", (rlt: RaceLapTime) => [rlt.Race])
export class RaceLapTime {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint", { name: "RaceId" })
  @ManyToOne(() => Race, r => r.RaceLapTimeList)
  @JoinColumn({ name: "RaceId" })
  public Race: Race;

  @Column("smallint")
  public KaishiKyori: number;

  @Column("smallint")
  public ShuuryouKyori: number;

  @Column("float")
  public LapTime: number;
}