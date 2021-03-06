import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("RaceLapTime")
@Index("IxRaceLapTime", (rlt: RaceLapTime) => [rlt.RaceId])
export class RaceLapTime {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("int")
  public RaceId: number;

  @Column("smallint")
  public KaishiKyori: number;

  @Column("smallint")
  public ShuuryouKyori: number;

  @Column("real")
  public LapTime: number;
}