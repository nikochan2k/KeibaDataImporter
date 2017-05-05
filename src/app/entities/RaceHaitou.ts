import {
  Entity, Index, Column, PrimaryColumn, ManyToOne, JoinColumn
} from "typeorm";
import { Race } from "./Race";

@Entity("RaceHaitou")
@Index("IxRaceHaitou", (rh: RaceHaitou) => [rh.Race, rh.BakenShubetsu])
export class RaceHaitou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint", { name: "RaceId" })
  @ManyToOne(() => Race, r => r.RaceHaitouList)
  @JoinColumn({ name: "RaceId" })
  public Race: Race;

  @Column("smallint")
  public BakenShubetsu: number; // 1:単勝 2:複勝 3:枠連 4:馬連 5:ワイド 6:馬単 7:三連複 8:三連単

  @Column("smallint")
  public Bangou1: number;

  @Column("smallint", { nullable: true })
  public Bangou2?: number;

  @Column("smallint", { nullable: true })
  public Bangou3?: number;

  @Column("int")
  public Haitoukin: number;
}