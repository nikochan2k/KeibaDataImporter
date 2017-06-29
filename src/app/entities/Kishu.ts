import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn
  } from "typeorm";
import { Choukyou } from "./Choukyou";
import { Record } from "./Record";

@Entity("Kishu")
@Index("IxKishu1", (k: Kishu) => [k.TanshukuKishuMei, k.KishuMei], { unique: true })
@Index("IxKishu2", (k: Kishu) => [k.KishuMei])
export class Kishu {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("varchar", { length: 12 })
  public TanshukuKishuMei: string;

  @Column("date")
  public FromDate: Date;

  @Column("date")
  public ToDate: Date;

  @Column("varchar", { length: 48, nullable: true })
  public KishuMei?: string;

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

  @OneToMany(() => Choukyou, c => c.Kishu)
  public ChoukyouList: Choukyou[];

  @OneToMany(() => Record, r => r.Kishu)
  public RecordList: Record[];
}