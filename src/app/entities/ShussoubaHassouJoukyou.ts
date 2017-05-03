import {
  Entity, Index, Column, PrimaryColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { RaceHassouJoukyou } from "./RaceHassouJoukyou";
import { Shussouba } from "./Shussouba";

@Entity("ShussoubaHassouJoukyou")
@Index("IxShussoubaHassouJoukyou", (shj: ShussoubaHassouJoukyou) =>
  [shj.RaceHassouJoukyou, shj.Shussouba])
export class ShussoubaHassouJoukyou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint", { name: "RaceHassouJoukyouId" })
  @ManyToOne(() => RaceHassouJoukyou, rhj => rhj.ShussoubaHassouJoukyouList)
  @JoinColumn({ name: "RaceHassouJoukyouId" })
  public RaceHassouJoukyou: RaceHassouJoukyou;

  @Column("bigint", { name: "ShussoubaId" })
  @ManyToOne(() => Shussouba, s => s.ShussoubaHassouJoukyouList)
  @JoinColumn({ name: "ShussoubaId" })
  public Shussouba: Shussouba;
}
