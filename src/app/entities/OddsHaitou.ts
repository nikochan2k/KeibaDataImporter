import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";
import { Baken, Kakutei } from "../converters/Common";

@Entity("OddsHaitou")
@Index("IxOddsHaitou", (o: OddsHaitou) => [o.RaceId, o.Baken])
export class OddsHaitou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("int")
  public RaceId: number;

  @Column("tinyint")
  public Baken: Baken;

  @Column("tinyint", { nullable: true })
  public Kakutei: Kakutei;

  @Column("tinyint")
  public Bangou1: number;

  @Column("tinyint", { nullable: true })
  public Bangou2?: number;

  @Column("tinyint", { nullable: true })
  public Bangou3?: number;

  @Column("real", { nullable: true })
  public Odds1: number;

  @Column("real", { nullable: true })
  public Odds2?: number;

  @Column("int", { nullable: true })
  public Haitoukin?: number;

  @Column("tinyint", { nullable: true })
  public Ninki?: number;
}
