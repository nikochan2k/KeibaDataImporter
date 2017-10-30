import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Uma")
@Index("IxUma1", (u: Uma) => [u.KolUmaCode], { unique: true })
@Index("IxUma2", (u: Uma) => [u.KettouTourokuBangou], { unique: true })
@Index("IxUma3", (u: Uma) => [u.KanaBamei])
@Index("IxUma4", (u: Uma) => [u.EigoBamei])
export class Uma {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("int", { nullable: true })
  public KolUmaCode?: number;

  @Column("varchar", { length: 8, nullable: true })
  public KettouTourokuBangou?: string;

  @Column("varchar", { length: 3, nullable: true })
  public FamilyNumber?: string;

  @Column("varchar", { length: 54, nullable: true })
  public KanaBamei?: string;

  @Column("varchar", { length: 34, nullable: true })
  public EigoBamei?: string;

  @Column("varchar", { length: 60, nullable: true })
  public KyuuBamei: string;

  @Column("smallint", { nullable: true })
  public Seinen?: number;

  @Column("int", { nullable: true })
  public Seinengappi?: number;

  @Column("tinyint", { nullable: true })
  public Keiro?: number;

  @Column("tinyint", { nullable: true })
  public Kesshu?: number;

  @Column("varchar", { length: 3, nullable: true })
  public SanchiCode?: string;

  @Column("smallint", { nullable: true })
  public Sanchi?: number;

  @Column("varchar", { length: 12, nullable: true })
  public SanchiMei?: string;

  @Column("tinyint", { nullable: true })
  public Seibetsu?: number;

  @Column("int", { nullable: true })
  public ChichiUmaId?: number;

  @Column("int", { nullable: true })
  public HahaUmaId?: number;

  @Column("tinyint", { nullable: true })
  public MasshouFlag?: number;

  @Column("int", { nullable: true })
  public MasshouNengappi?: number;

  @Column("varchar", { length: 9, nullable: true })
  public Jiyuu?: string;

  @Column("varchar", { length: 15, nullable: true })
  public Ikisaki?: string;

  @Column("tinyint", { nullable: true })
  public YunyuubaFlag?: number;

  @Column("tinyint", { nullable: true })
  public KyoriTekisei?: number;

  @Column("tinyint", { nullable: true })
  public OmoKousetsu?: number;

  @Column("tinyint", { nullable: true })
  public DirtKousetsu?: number;

  @Column("smallint", { nullable: true })
  public ShibouNen?: number;

  @Column("tinyint", { nullable: true })
  public ChichiKeitouCode?: number;

  @Column("tinyint", { nullable: true })
  public HahaChichiKeitouCode?: number;
}
