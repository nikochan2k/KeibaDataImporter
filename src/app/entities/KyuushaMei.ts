import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("KyuushaMei")
@Index("IxKyuushaMei", (k: KyuushaMei) => [k.KyuushaId, k.JinmeiId], { unique: true })
export class KyuushaMei {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("bigint")
  public KyuushaId: number;

  @Column("bigint")
  public JinmeiId: number;
}