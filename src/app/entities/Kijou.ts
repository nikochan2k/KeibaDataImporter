import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
  } from "typeorm";
import { Kishu } from "./Kishu";
import { Shozoku } from "./Shozoku";
import { Shussouba } from "./Shussouba";

@Entity("Kijou")
@Index("IxKijou", (k: Kijou) => [k.Kishu, k.Shozoku, k.MinaraiKubun], { unique: true })
export class Kijou {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("int", { name: "KishuId" })
  @ManyToOne(() => Kishu, k => k.KijouList)
  @JoinColumn({ name: "KishuId" })
  public Kishu: Kishu;

  @Column("int", { name: "ShozokuId" })
  @ManyToOne(() => Shozoku, k => k.KijouList)
  @JoinColumn({ name: "ShozokuId" })
  public Shozoku: Shozoku;

  @Column("smallint")
  public MinaraiKubun: number;

  @OneToMany(() => Shussouba, s => s.Kijou)
  public ShussoubaList: Shussouba[];
}