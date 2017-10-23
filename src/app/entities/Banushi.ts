import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Banushi")
@Index("IxBanushi", (b: Banushi) => [b.BanushiMei], { unique: true })
export class Banushi {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("varchar", { length: 60 })
  public BanushiMei: string;

  @Column("varchar", { length: 30 })
  public TanshukuBanushiMei: string;

  @Column("tinyint", { nullable: true })
  public BanushiKaiCode: number;
}
