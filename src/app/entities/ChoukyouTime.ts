import {
  Entity, Index, Column, PrimaryColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Choukyou } from "./Choukyou";

@Entity("ChoukyouTime")
@Index("IxChoukyouTime", (c: ChoukyouTime) => [c.Choukyou])
export class ChoukyouTime {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint", { name: "ChoukyouId" })
  @ManyToOne(() => Choukyou, c => c.ChoukyouTimeList)
  @JoinColumn({ name: "ChoukyouId" })
  public Choukyou: Choukyou;

  @Column("smallint")
  public F: number;

  @Column("float", { nullable: true })
  public Time?: number;

  @Column("string", { nullable: true })
  public Comment?: string;
}
