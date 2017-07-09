import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";
import { Baken } from "../converters/Common";

@Entity("OddsHaitou")
@Index("IxOddsHaitou", (o: OddsHaitou) => [o.RaceId, o.Baken])
export class OddsHaitou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("smallint")
  public Baken: Baken;

  @Column("smallint", { nullable: true })
  public YosouKakutei?: number;

  @Column("smallint")
  public Bangou1: number;

  @Column("smallint", { nullable: true })
  public Bangou2?: number;

  @Column("smallint", { nullable: true })
  public Bangou3?: number;

  @Column("smallint", { nullable: true })
  public Odds1?: number;

  @Column("smallint", { nullable: true })
  public Odds2?: number;

  @Column("int", { nullable: true })
  public Haitoukin?: number;

  @Column("smallint", { nullable: true })
  public Ninki?: number;
}
