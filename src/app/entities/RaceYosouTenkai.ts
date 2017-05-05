import {
  Entity, Index, Column, PrimaryColumn, ManyToOne, JoinColumn
} from "typeorm";
import { Race } from "./Race";

@Entity("RaceYosouTenkai")
@Index("IxRaceYosouTenkai", (ryt: RaceYosouTenkai) => [ryt.Race])
export class RaceYosouTenkai {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint", { name: "RaceId" })
  @ManyToOne(() => Race, r => r.RaceYosouTenkaiList)
  @JoinColumn({ name: "RaceId" })
  public Race: Race;

  @Column("smallint")
  public Kyakushitsu: number; // 0:逃げ 1:先行 2:差し 3:追込

  @Column("smallint")
  public Umaban1: number;

  @Column("smallint", { nullable: true })
  public Umaban2?: number;

  @Column("smallint", { nullable: true })
  public Umaban3?: number;

  @Column("smallint", { nullable: true })
  public Umaban4?: number;
}