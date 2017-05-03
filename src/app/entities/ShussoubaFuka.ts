import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Shussouba } from "./Shussouba";

@Entity("ShussoubaFuka")
export class ShussoubaFuka {
  @PrimaryColumn("bigint", { name: "Id" })
  @OneToOne(() => Shussouba, s => s.ShussoubaFuka)
  @JoinColumn({ name: "Id" })
  public Shussouba: Shussouba;

  @Column("smallint", { nullable: true })
  public RecordShisuu?: number;

  @Column("smallint", { nullable: true })
  public Yosou1?: number;

  @Column("smallint", { nullable: true })
  public Yosou2?: number;

  @Column("string", { length: 7, nullable: true })
  public ChoukyouTanpyou?: string;

  @Column("smallint", { nullable: true })
  public ChoukyouHonsuuCourse?: number;

  @Column("smallint", { nullable: true })
  public ChoukyouHonsuuHanro?: number;

  @Column("smallint", { nullable: true })
  public ChoukyouHonsuuPool?: number;

  @Column("float", { nullable: true })
  public Rating?: number;

  @Column("string", { length: 90, nullable: true })
  public KyuuyouRiyuu?: string;
}
