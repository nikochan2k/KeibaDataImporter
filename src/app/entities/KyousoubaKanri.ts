import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
  } from "typeorm";
import { Banushi } from "./Banushi";
import { Kyousouba } from "./Kyousouba";
import { Kyuusha } from "./Kyuusha";

@Entity("KyousoubaKanri")
@Index("IxKyousoubaKanri", (kr: KyousoubaKanri) => [kr.UmaKigou, kr.Banushi, kr.Kyuusha], { unique: true })
export class KyousoubaKanri {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("smallint")
  public UmaKigou: number;

  @Column("int", { name: "BanushiId" })
  @ManyToOne(() => Banushi, Banushi => Banushi.KyousoubaKanriList)
  @JoinColumn({ name: "BanushiId" })
  public Banushi: Banushi;

  @Column("int", { name: "KyuushaId", nullable: true })
  @ManyToOne(() => Kyuusha, Kyuusha => Kyuusha.KyousoubaKanriList)
  @JoinColumn({ name: "KyuushaId" })
  public Kyuusha?: Kyuusha;

  @Column("varchar", { length: 12, nullable: true })
  public KoueiGaikokuKyuushaMei?: string;

  @OneToMany(() => Kyousouba, k => k.KyousoubaKanri)
  public KyousoubaList: Kyousouba[];
}
