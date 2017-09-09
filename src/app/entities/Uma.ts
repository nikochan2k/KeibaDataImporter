import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Uma")
@Index("IxUma", (u: Uma) => [u.Bamei])
export class Uma {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("varchar", { length: 54 })
  public Bamei: string;

  @Column("varchar", { length: 60, nullable: true })
  public KyuuBamei: string;

  @Column("smallint", { nullable: true })
  public Seinen?: number;

  @Column("int", { nullable: true })
  public Seinengappi?: number;

  @Column("smallint", { nullable: true })
  public Keiro?: number;

  @Column("smallint", { nullable: true })
  public Kesshu?: number;

  @Column("smallint", { nullable: true })
  public Sanchi?: number;

  @Column("varchar", { length: 12, nullable: true })
  public SanchiMei?: string;

  @Column("smallint", { nullable: true })
  public Seibetsu?: number;

  @Column("int", { nullable: true })
  public ChichiUmaId?: number;

  @Column("int", { nullable: true })
  public HahaUmaId?: number;

  @Column("int", { nullable: true })
  public SeisanshaId?: number;

  @Column("smallint", { nullable: true })
  public MasshouFlag?: number;

  @Column("bigint", { nullable: true })
  public MasshouNengappi?: number;

  @Column("varchar", { length: 9, nullable: true })
  public Jiyuu?: string;

  @Column("varchar", { length: 15, nullable: true })
  public Ikisaki?: string;

  @Column("smallint", { nullable: true })
  public YunyuubaFlag?: number;

  @Column("smallint", { nullable: true })
  public ShibouNen?: number;

  @Column("varchar", { length: 8, nullable: true })
  public KettouTourokuBangou?: string;

  @Column("tinyint", { nullable: true })
  public ChichiKeitouCode?: number;

  @Column("tinyint", { nullable: true })
  public HahaChichiKeitouCode?: number;
}
