import {
  Entity, Index, Column, PrimaryColumn, ManyToOne, JoinColumn
} from "typeorm";
import { Race } from "./Race";

@Entity("RaceJoukenFuka")
@Index("IxRaceJoukenFuka", (rjf: RaceJoukenFuka) => [rjf.Race])
export class RaceJoukenFuka {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint", { name: "RaceId" })
  @ManyToOne(() => Race, r => r.RaceJoukenFukaList)
  @JoinColumn({ name: "RaceId" })
  public Race: Race;

  @Column("smallint")
  public JoukenFuka: number;
}