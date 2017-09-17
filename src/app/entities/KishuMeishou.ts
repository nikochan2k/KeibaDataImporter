import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("KishuMeishou")
@Index("IxKishuMeishou", (k: KishuMeishou) => [k.KishuId, k.MeishouId], { unique: true })
export class KishuMeishou {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("bigint")
  public KishuId: number;

  @Column("bigint")
  public MeishouId: number;
}