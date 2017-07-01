import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";
import { Baken } from "../converters/Common";

@Entity("OddsKubun")
@Index("IxOddsKubun",
  (ok: OddsKubun) => [ok.RaceId, ok.Baken, ok.YosouKakutei])
export class OddsKubun {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("smallint")
  public Baken: Baken;

  @Column("smallint")
  public YosouKakutei: number;
}