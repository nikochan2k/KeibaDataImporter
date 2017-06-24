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
import { Kyuusha } from "./Kyuusha";
import { Shussouba } from "./Shussouba";
import { Uma } from "./Uma";

@Entity("Kyousouba")
@Index("IxKyousouba", (k: Kyousouba) => [k.Uma])
export class Kyousouba {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("int", { name: "UmaId" })
  @ManyToOne(() => Uma, u => u.KyousoubaList)
  @JoinColumn({ name: "UmaId" })
  public Uma: Uma;

  @Column("smallint")
  public Seibetsu: number;

  @Column("smallint")
  public UmaKigou: number;

  @Column("int", { name: "BanushiId" })
  @ManyToOne(() => Banushi, Banushi => Banushi.KyousoubaList)
  @JoinColumn({ name: "BanushiId" })
  public Banushi: Banushi;

  @Column("int", { name: "KyuushaId", nullable: true })
  @ManyToOne(() => Kyuusha, k => k.KyousoubaList)
  @JoinColumn({ name: "KyuushaId" })
  public Kyuusha?: Kyuusha;

  @Column("varchar", { length: 12, nullable: true })
  public KoueiGaikokuKyuushaMei?: string;

  @OneToMany(() => Shussouba, s => s.Kyousouba)
  public ShussoubaList: Shussouba[];
}
