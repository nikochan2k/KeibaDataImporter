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

  @ManyToOne(() => Uma, u => u.KyousoubaList)
  @JoinColumn({ name: "UmaId" })
  public Uma: Uma;

  @Column("smallint")
  public Seibetsu: number;

  @Column("smallint")
  public UmaKigou: number;

  @ManyToOne(() => Banushi, Banushi => Banushi.KyousoubaList)
  @JoinColumn({ name: "BanushiId" })
  public Banushi: Banushi;

  @ManyToOne(() => Kyuusha, k => k.KyousoubaList, { nullable: true })
  @JoinColumn({ name: "KyuushaId" })
  public Kyuusha?: Kyuusha;

  @Column("varchar", { length: 12, nullable: true })
  public KoueiGaikokuKyuushaMei?: string;

  @OneToMany(() => Shussouba, s => s.Kyousouba)
  public ShussoubaList: Shussouba[];
}
