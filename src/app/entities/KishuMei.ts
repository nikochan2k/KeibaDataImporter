import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("KishuMei")
@Index("IxKishuMei1", (k: KishuMei) => [k.KishuId, k.JinmeiId], { unique: true })
@Index("IxKishuMei2", (k: KishuMei) => [k.JinmeiId])
export class KishuMei {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("mediumint")
  public KishuId: number;

  @Column("mediumint")
  public JinmeiId: number;
}