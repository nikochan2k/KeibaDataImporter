import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
  } from "typeorm";
import { KijouKishu } from "./KijouKishu";
import { Kyuusha } from "./Kyuusha";

@Entity("KishuShozoku")
@Index("IxKishuShozoku", (ks: KishuShozoku) => [ks.TouzaiBetsu, ks.ShozokuBasho, ks.Kyuusha], { unique: true })
export class KishuShozoku {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("smallint", { nullable: true })
  public TouzaiBetsu?: number;

  @Column("smallint", { nullable: true })
  public ShozokuBasho?: number;

  @Column("int", { name: "KyuushaId", nullable: true })
  @ManyToOne(() => Kyuusha, Kyuusha => Kyuusha.KishuShozokuList)
  @JoinColumn({ name: "KyuushaId" })
  public Kyuusha?: Kyuusha;

  @OneToMany(() => KijouKishu, kk => kk.Kishu)
  public KijouKishuList: KijouKishu[];
}