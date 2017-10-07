import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("KishuRireki")
@Index("IxKishuRireki", (k: KishuRireki) => [k.KishuId])
export class KishuRireki {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("bigint")
  public KishuId: number;

  @Column("tinyint")
  public KishuTouzaiBetsu: number;

  @Column("tinyint", { nullable: true })
  public KishuShozokuBasho?: number;

  @Column("tinyint", { nullable: true })
  public KijouShikakuKubun?: number;

  @Column("int", { nullable: true })
  public KishuShozokuKyuushaId: number;

  @Column("tinyint")
  public MinaraiKubun: number;

  @Column("tinyint")
  public TourokuMasshouFlag: number;

  @Column("int", { nullable: true })
  public TourokuMasshouNengappi?: number;
}