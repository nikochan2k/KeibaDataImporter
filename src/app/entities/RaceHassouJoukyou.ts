import {
  Entity, Index, Column, PrimaryColumn, OneToMany, ManyToOne, JoinColumn
} from 'typeorm';
import { Race } from "./Race";
import { ShussoubaHassouJoukyou } from "./ShussoubaHassouJoukyou";

@Entity("RaceHassouJoukyou")
@Index("IxRaceHassouJoukyou", (rhj: RaceHassouJoukyou) => [rhj.Race])
export class RaceHassouJoukyou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint", { name: "RaceId" })
  @ManyToOne(() => Race, r => r.RaceHassouJoukyouList)
  @JoinColumn({ name: "RaceId" })
  public Race: Race;

  @Column("string", { length: 120, nullable: true })
  public HassouJoukyou: string;

  @OneToMany(() => ShussoubaHassouJoukyou, shj => shj.RaceHassouJoukyou)
  public ShussoubaHassouJoukyouList: ShussoubaHassouJoukyou[];
}