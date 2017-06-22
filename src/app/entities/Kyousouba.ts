import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
  } from "typeorm";
import { KyousoubaKanri } from "./KyousoubaKanri";
import { Shussouba } from "./Shussouba";
import { Uma } from "./Uma";

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
  @ManyToOne(() => KyousoubaKanri, kr => kr.KyousoubaList)
  @JoinColumn({ name: "KyousoubaRirekiId" })
  public KyousoubaRireki: KyousoubaKanri;

  @OneToMany(() => Shussouba, s => s.Kyousouba)
  public ShussoubaList: Shussouba[];
}
