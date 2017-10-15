import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("KishuMei")
@Index("IxKishuMei", (k: KishuMei) => [k.KishuId, k.JinmeiId], { unique: true })
export class KishuMei {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("bigint")
  public KishuId: number;

  @Column("bigint")
  public JinmeiId: number;
}