import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Kyousouba")
@Index("IxKyousouba", (k: Kyousouba) => [k.UmaId])
export class Kyousouba {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("int")
  public UmaId: number;

  @Column("smallint", { nullable: true })
  public Seibetsu: number;

  @Column("smallint", { nullable: true })
  public UmaKigou: number;

  @Column("mediumint", { nullable: true })
  public ChoukyoushiId?: number;

  @Column("varchar", { length: 12, nullable: true })
  public KoueiGaikokuChoukyoushiMei?: string;
}
