import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Odds")
@Index("IxOdds", (o: Odds) => [o.OddsKubunId])
export class Odds {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("bigint")
  public OddsKubunId: number;

  @Column("smallint")
  public Bangou1: number;

  @Column("smallint", { nullable: true })
  public Bangou2?: number;

  @Column("smallint", { nullable: true })
  public Bangou3?: number;

  @Column("smallint", { nullable: true })
  public Odds1: number;

  @Column("smallint", { nullable: true })
  public Odds2: number;
}
