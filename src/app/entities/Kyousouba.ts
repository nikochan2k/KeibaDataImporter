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

  @Column("smallint")
  public Seibetsu: number;

  @Column("smallint")
  public UmaKigou: number;

  @Column("mediumint", { nullable: true })
  public BanushiId?: number;

  @Column("mediumint", { nullable: true })
  public KyuushaId?: number;

  @Column("varchar", { length: 12, nullable: true })
  public KoueiGaikokuKyuushaMei?: string;
}
