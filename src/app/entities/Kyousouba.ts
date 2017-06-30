import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Kyousouba")
@Index("IxKyousouba", (k: Kyousouba) => [k.UmaId])
export class Kyousouba {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("int")
  public UmaId: number;

  @Column("smallint")
  public Seibetsu: number;

  @Column("smallint")
  public UmaKigou: number;

  @Column("int", { nullable: true })
  public BanushiId?: number;

  @Column("int", { nullable: true })
  public KyuushaId?: number;

  @Column("varchar", { length: 12, nullable: true })
  public KoueiGaikokuKyuushaMei?: string;
}
