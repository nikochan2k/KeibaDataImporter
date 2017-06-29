import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("RaceClass")
export class RaceClass {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("smallint")
  public ChuuouChihouGaikoku: number;

  @Column("smallint")
  public IppanTokubetsu: number;

  @Column("smallint")
  public HeichiShougai: number;

  @Column("smallint", { nullable: true })
  public JoukenKei: number;

  @Column("smallint", { nullable: true })
  public KouryuuFlag?: number;

  @Column("varchar", { nullable: true, length: 45 })
  public TokubetsuMei: string;

  @Column("varchar", { nullable: true, length: 21 })
  public TanshukuTokubetsuMei: string;

  @Column("smallint", { nullable: true })
  public Grade?: number;

  @Column("smallint", { nullable: true })
  public Jouken1?: number;

  @Column("smallint", { nullable: true })
  public Kumi1?: number;

  @Column("smallint", { nullable: true })
  public IjouIkaMiman?: number;

  @Column("smallint", { nullable: true })
  public Jouken2?: number;

  @Column("smallint", { nullable: true })
  public Kumi2?: number;

}

