import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Kyuusha")
@Index("IxKyuusha1", (k: Kyuusha) => [k.KyuushaMei])
@Index("IxKyuusha2", (k: Kyuusha) => [k.KolKyuushaCode], { unique: true })
@Index("IxKyuusha3", (k: Kyuusha) => [k.JrdbKyuushaCode], { unique: true })
export class Kyuusha {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("int", { nullable: true })
  public KolKyuushaCode?: number;

  @Column("int", { nullable: true })
  public JrdbKyuushaCode?: number;

  @Column("varchar", { length: 48, nullable: true })
  public KyuushaMei?: string;

  @Column("varchar", { length: 12, nullable: true })
  public TanshukuKyuushaMei?: string;

  @Column("varchar", { length: 72, nullable: true })
  public Furigana?: string;

  @Column("bigint", { nullable: true })
  public Seinengappi?: number;

  @Column("smallint", { nullable: true })
  public HatsuMenkyoNen?: number;

  @Column("smallint", { nullable: true })
  public TouzaiBetsu?: number;

  @Column("smallint", { nullable: true })
  public ShozokuBasho?: number;

  @Column("varchar", { length: 6, nullable: true })
  public ShozokuBashoMei?: string;

  @Column("smallint", { nullable: true })
  public RitsuHokuNanBetsu?: number;
}