import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("RaceTrackBias")
@Index("IxRaceTrackBias", (rk: RaceTrackBias) => [rk.RaceId])
export class RaceTrackBias {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("smallint")
  public Ichi: number;

  @Column("smallint")
  public Baba: number;

  @Column("smallint")
  public BabaShousai: number; // 0:普通 1:速い 2:遅い
}
