import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Uma } from "./Uma";
import { KyousoubaRireki } from "./KyousoubaRireki";
import { Shussouba } from "./Shussouba";

@Entity("Kyousouba")
@Index("IxKyousouba", (k: Kyousouba) => [k.Uma, k.Seibetsu, k.KyousoubaRireki])
export class Kyousouba {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("int", { name: "UmaId" })
  @ManyToOne(() => Uma, u => u.KyousoubaList)
  @JoinColumn({ name: "UmaId" })
  public Uma: Uma;

  @Column("smallint")
  public Seibetsu: number;

  @Column("int", { name: "KyousoubaRirekiId" })
  @ManyToOne(() => KyousoubaRireki, kr => kr.KyousoubaList)
  @JoinColumn({ name: "KyousoubaRirekiId" })
  public KyousoubaRireki: KyousoubaRireki;

  @OneToMany(() => Shussouba, s => s.Kyousouba)
  public ShussoubaList: Shussouba[];
}
