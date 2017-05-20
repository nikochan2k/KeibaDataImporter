import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from "typeorm";
import { Shussouba } from "./Shussouba";

@Entity("ShussoubaYosou")
export class ShussoubaYosou {
  @PrimaryColumn("bigint", { name: "Id" })
  @OneToOne(() => Shussouba, s => s.ShussoubaYosou)
  @JoinColumn({ name: "Id" })
  public Shussouba: Shussouba;

  @Column("smallint", { nullable: true })
  public KolYosou1?: number;

  @Column("smallint", { nullable: true })
  public KolYosou2?: number;

  @Column("smallint", { nullable: true })
  public KolRecordShisuu?: number;

  @Column("string", { length: 7, nullable: true })
  public ChoukyouTanpyou?: string;

  @Column("float", { nullable: true })
  public Rating?: number;
}
