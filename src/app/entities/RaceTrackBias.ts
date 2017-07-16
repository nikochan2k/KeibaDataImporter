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
  public Midashi: number;

  @Column("smallint")
  public Ichi: number;

  @Column("smallint")
  public TrackBias: number;
}
