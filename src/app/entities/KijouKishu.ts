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
import { KishuShozoku } from "./KishuShozoku";
import { Shussouba } from "./Shussouba";

@Entity("KijouKishu")
@Index("IxKijouKishu", (kk: KijouKishu) => [kk.Kishu, kk.KishuShozoku, kk.MinaraiKubun], { unique: true })
export class KijouKishu {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("int", { name: "KishuId" })
  @ManyToOne(() => Kishu, k => k.KijouKishuList)
  @JoinColumn({ name: "KishuId" })
  public Kishu: Kishu;

  @Column("int", { name: "KishuShozokuId" })
  @ManyToOne(() => KishuShozoku, ks => ks.KijouKishuList)
  @JoinColumn({ name: "KishuShozokuId" })
  public KishuShozoku: KishuShozoku;

  @Column("smallint")
  public MinaraiKubun: number;

  @OneToMany(() => Shussouba, s => s.KijouKishu)
  public ShussoubaList: Shussouba[];
}