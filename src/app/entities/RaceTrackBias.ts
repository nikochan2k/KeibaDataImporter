import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";
import { Ichi } from "../converters/Shussouba";
import { Midashi } from "../converters/Race";

@Entity("RaceTrackBias")
@Index("IxRaceTrackBias", (rk: RaceTrackBias) => [rk.RaceId])
export class RaceTrackBias {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("smallint")
  public Midashi: Midashi;

  @Column("smallint")
  public Ichi: Ichi;

  @Column("smallint")
  public TrackBias: number;
}
