import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
  } from "typeorm";
import { Shussouba } from "./Shussouba";

@Entity("ShussoubaBagu")
@Index("IxShussoubaBagu", (sb: ShussoubaBagu) => [sb.Shussouba])
export class ShussoubaBagu {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint", { name: "ShussoubaId" })
  @ManyToOne(() => Shussouba, s => s.ShussoubaBaguList)
  @JoinColumn({ name: "ShussoubaId" })
  public Shussouba: Shussouba;

  @Column("smallint")
  public BaguShubetsu: number;

  @Column("smallint")
  public Bagu: number;
}