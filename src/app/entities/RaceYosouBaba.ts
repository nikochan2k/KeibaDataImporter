import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("RaceYosouBaba")
@Index("IxRaceYosouBaba", (rk: RaceYosouBaba) => [rk.RaceId])
export class RaceYosouBaba {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("smallint")
  public Midashi: number;

  @Column("smallint")
  public Ichi: number;

  @Column("smallint")
  public BabaJoutai: number;
}
