import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Choukyoushi")
@Index("IxChoukyoushi1", (c: Choukyoushi) => [c.KolKyuushaCode], { unique: true })
@Index("IxChoukyoushi2", (c: Choukyoushi) => [c.JrdbChoukyoushiCode], { unique: true })
@Index("IxChoukyoushi4", (c: Choukyoushi) => [c.JvDataChoukyoushiCode], { unique: true })
export class Choukyoushi {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("mediumint", { nullable: true })
  public KolKyuushaCode?: number;

  @Column("mediumint", { nullable: true })
  public JrdbChoukyoushiCode?: number;

  @Column("varchar", { length: 5, nullable: true })
  public JvDataChoukyoushiCode?: string;

  @Column("int", { nullable: true })
  public Seinengappi?: number;

  @Column("tinyint", { nullable: true })
  public Seibetsu?: number;

  @Column("smallint", { nullable: true })
  public HatsuMenkyoNen?: number;

  @Column("tinyint", { nullable: true })
  public TouzaiBetsu?: number;

  @Column("tinyint", { nullable: true })
  public ShozokuBasho?: number;

  @Column("varchar", { length: 30, nullable: true })
  public ShozokuBashoMei?: string;

  @Column("tinyint", { nullable: true })
  public RitsuHokuNanBetsu?: number;

  @Column("int", { nullable: true })
  public MenkyoKoufuNengappi?: number;

  @Column("int", { nullable: true })
  public MenkyoMasshouNengappi?: number;
}