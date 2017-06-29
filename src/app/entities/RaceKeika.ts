import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("RaceKeika")
@Index("IxRaceKeika", (rk: RaceKeika) => [rk.RaceId])
export class RaceKeika {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("varchar", { length: 165 })
  public Keika: string;

  @Column("smallint", { nullable: true })
  public Midashi1?: number;

  @Column("smallint", { nullable: true })
  public Midashi2?: number;
}
