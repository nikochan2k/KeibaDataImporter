import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("RaceShoukin")
@Index("IxRaceShoukin", (rs: RaceShoukin) => [rs.RaceId])
export class RaceShoukin {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("smallint")
  public Kakutei: number;

  @Column("smallint")
  public Chakujun: number;

  @Column("int")
  public Shoukin: number;

  @Column("smallint")
  public Fukashou: number;
}