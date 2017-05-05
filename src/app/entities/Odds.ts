import {
  Entity, Index, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn
} from "typeorm";
import { OddsKubun } from "./OddsKubun";

@Entity("Odds")
@Index("IxOdds", (o: Odds) => [o.OddsKubun])
export class Odds {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("bigint", { name: "OddsKubunId" })
  @ManyToOne(() => OddsKubun, ok => ok.OddsList)
  @JoinColumn({ name: "OddsKubunId" })
  public OddsKubun: OddsKubun;

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
