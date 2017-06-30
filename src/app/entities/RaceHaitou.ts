import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("RaceHaitou")
@Index("IxRaceHaitou", (rh: RaceHaitou) => [rh.RaceId, rh.Baken])
export class RaceHaitou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

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