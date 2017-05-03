import { Entity, Index, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Shussouba } from "./Shussouba";

@Entity("ShussoubaTsuukaJuni")
@Index("IxShussoubaTsuukaJuni", (stj: ShussoubaTsuukaJuni) => [stj.Shussouba])
export class ShussoubaTsuukaJuni {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint", { name: "ShussoubaId" })
  @ManyToOne(() => Shussouba, s => s.ShussoubaTsuukaJuniList)
  @JoinColumn({ name: "ShussoubaId" })
  public Shussouba: Shussouba;

  @Column("smallint")
  public Bangou: number;

  @Column("smallint", { nullable: true })
  public Juni?: number;

  @Column("smallint", { nullable: true })
  public Joukyou?: number;
}