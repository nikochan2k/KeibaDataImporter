import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Choukyoushi")
@Index("IxChoukyoushi1", (c: Choukyoushi) => [c.KolKyuushaCode], { unique: true })
@Index("IxChoukyoushi2", (c: Choukyoushi) => [c.JrdbChoukyoushiCode], { unique: true })
export class Choukyoushi {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("mediumint", { nullable: true })
  public KolKyuushaCode?: number;

  @Column("mediumint", { nullable: true })
  public JrdbChoukyoushiCode?: number;

  @Column("int", { nullable: true })
  public Seinengappi?: number;

  @Column("smallint", { nullable: true })
  public HatsuMenkyoNen?: number;

  @Column("tinyint", { nullable: true })
  public TouzaiBetsu?: number;

  @Column("tinyint", { nullable: true })
  public ShozokuBasho?: number;

  @Column("varchar", { length: 6, nullable: true })
  public ShozokuBashoMei?: string;

  @Column("tinyint", { nullable: true })
  public RitsuHokuNanBetsu?: number;

  @Column("tinyint", { nullable: true })
  public TourokuMasshouFlag?: number;

  @Column("int", { nullable: true })
  public TourokuMasshouNengappi?: number;
}