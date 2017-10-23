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

  @Column("int")
  public RaceId: number;

  @Column("tinyint")
  public Midashi: Midashi;

  @Column("tinyint")
  public Ichi: Ichi;

  @Column("tinyint")
  public TrackBias: number;
}
