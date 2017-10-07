import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Kishu")
@Index("IxKishu1", (k: Kishu) => [k.KolKishuCode], { unique: true })
@Index("IxKishu2", (k: Kishu) => [k.JrdbKishuCode], { unique: true })
export class Kishu {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("int", { nullable: true })
  public KolKishuCode?: number;

  @Column("int", { nullable: true })
  public JrdbKishuCode?: number;

  @Column("bigint", { nullable: true })
  public Seinengappi?: number;

  @Column("smallint", { nullable: true })
  public HatsuMenkyoNen?: number;
}