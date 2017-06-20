import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { KyousoubaRireki } from "./KyousoubaRireki";

@Entity("Banushi")
@Index("IxBanushi", (b: Banushi) => [b.BanushiMei], { unique: true })
export class Banushi {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("varchar", { length: 60 })
  public BanushiMei: string;

  @Column("varchar", { length: 30 })
  public TanshukuBanushiMei: string;

  @Column("smallint", { nullable: true })
  public BanushiKaiCode: number;

  @OneToMany(() => KyousoubaRireki, kr => kr.Banushi)
  public KyousoubaRirekiList: KyousoubaRireki[];
}
