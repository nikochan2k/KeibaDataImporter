import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn
  } from "typeorm";
import { Odds } from "./Odds";
import { Race } from "./Race";

@Entity("OddsKubun")
@Index("IxOddsKubun",
  (ok: OddsKubun) => [ok.Race, ok.BakenShubetsu, ok.YosouKakutei])
export class OddsKubun {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint", { name: "RaceId" })
  @ManyToOne(() => Race, Race => Race.OddsKubunList)
  @JoinColumn({ name: "RaceId" })
  public Race: Race;

  @Column("smallint")
  public BakenShubetsu: number;

  @Column("smallint")
  public YosouKakutei: number;

  @Column("date")
  public DataSakuseiNengappi: number;

  @OneToMany(() => Odds, o => o.OddsKubun)
  public OddsList: Odds[];
}