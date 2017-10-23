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

  @Column("mediumint")
  public KishuId: number;

  @Column("mediumint")
  public JinmeiId: number;
}