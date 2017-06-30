import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("OddsKubun")
@Index("IxOddsKubun",
  (ok: OddsKubun) => [ok.RaceId, ok.BakenShubetsu, ok.YosouKakutei])
export class OddsKubun {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("smallint")
  public BakenShubetsu: number;

  @Column("smallint")
  public YosouKakutei: number;

  @Column("date")
  public DataSakuseiNengappi: number;
}