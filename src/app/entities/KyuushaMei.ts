import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("KyuushaMei")
@Index("IxKyuushaMei1", (k: KyuushaMei) => [k.KyuushaId, k.JinmeiId], { unique: true })
@Index("IxKyuushaMei2", (k: KyuushaMei) => [k.JinmeiId])
export class KyuushaMei {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("mediumint")
  public KyuushaId: number;

  @Column("mediumint")
  public JinmeiId: number;
}