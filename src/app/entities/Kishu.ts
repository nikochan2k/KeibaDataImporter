import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn
  } from "typeorm";
import { KijouKishu } from "./KijouKishu";

@Entity("Kishu")
@Index("IxKishu", (k: Kishu) => [k.KishuMei], { unique: true })
export class Kishu {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("varchar", { length: 48 })
  public KishuMei: string;

  @Column("varchar", { length: 12 })
  public TanshukuKishuMei: string;

  @Column("int", { nullable: true })
  public KolKishuCode?: number;

  @Column("int", { nullable: true })
  public JrdbKishuCode?: number;

  @Column("varchar", { length: 72, nullable: true })
  public Furigana?: string;

  @Column("date", { nullable: true })
  public Seinengappi?: Date;

  @Column("smallint", { nullable: true })
  public HatsuMenkyoNen?: number;

  @OneToMany(() => KijouKishu, kk => kk.Kishu)
  public KijouKishuList: KijouKishu[];
}