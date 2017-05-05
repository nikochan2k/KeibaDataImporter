import {
  Entity, Index, Column, PrimaryGeneratedColumn, OneToMany
} from "typeorm";
import { Uma } from "./Uma";

@Entity("Banushi")
@Index("IxBanushi", (b: Banushi) => [b.BanushiMei])
export class Banushi {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("string", { length: 60 })
  public BanushiMei: string;

  @Column("string", { length: 30 })
  public TanshukuBanushiMei: string;

  @Column("smallint", { nullable: true })
  public BanushiKaiCode: number;

  @OneToMany(() => Uma, u => u.Banushi)
  public UmaList: Uma[];
}
