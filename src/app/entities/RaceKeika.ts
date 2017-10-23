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

  @Column("int")
  public RaceId: number;

  @Column("varchar", { length: 165 })
  public Keika: string;

  @Column("tinyint", { nullable: true })
  public Midashi1?: number;

  @Column("tinyint", { nullable: true })
  public Midashi2?: number;
}
