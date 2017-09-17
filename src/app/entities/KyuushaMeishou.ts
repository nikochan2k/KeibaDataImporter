import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("KyuushaMeishou")
@Index("IxKyuushaMeishou", (k: KyuushaMeishou) => [k.KyuushaId, k.MeishouId], { unique: true })
export class KyuushaMeishou {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("bigint")
  public KyuushaId: number;

  @Column("bigint")
  public MeishouId: number;
}