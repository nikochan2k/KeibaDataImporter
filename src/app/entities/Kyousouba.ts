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
@Index("IxKyousouba", (k: Kyousouba) => [k.Uma, k.Seibetsu, k.KyousoubaKanri])
export class Kyousouba {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("int", { name: "UmaId" })
  @ManyToOne(() => Uma, u => u.KyousoubaList)
  @JoinColumn({ name: "UmaId" })
  public Uma: Uma;

  @Column("smallint")
  public Seibetsu: number;

  @Column("int", { name: "KyousoubaKanriId" })
  @ManyToOne(() => KyousoubaKanri, kk => kk.KyousoubaList)
  @JoinColumn({ name: "KyousoubaKanriId" })
  public KyousoubaKanri: KyousoubaKanri;

  @OneToMany(() => Shussouba, s => s.Kyousouba)
  public ShussoubaList: Shussouba[];
}
