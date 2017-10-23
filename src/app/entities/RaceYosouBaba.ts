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

  @Column("int")
  public RaceId: number;

  @Column("tinyint")
  public Midashi: number;

  @Column("tinyint")
  public Ichi: number;

  @Column("tinyint")
  public BabaJoutai: number;
}
