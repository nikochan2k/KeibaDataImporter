import {
  Column,
  Entity,
  PrimaryColumn
} from "typeorm";

@Entity("ShussoubaHyouka")
export class ShussoubaHyouka {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("smallint", { nullable: true })
  public Idm?: number;

  @Column("smallint", { nullable: true })
  public IdmSoten?: number;

  @Column("smallint", { nullable: true })
  public IdmBabasa?: number;

  @Column("smallint", { nullable: true })
  public IdmPace?: number;

  @Column("smallint", { nullable: true })
  public IdmDeokure?: number;

  @Column("smallint", { nullable: true })
  public IdmIchidori?: number;

  @Column("smallint", { nullable: true })
  public IdmFuri?: number;

  @Column("smallint", { nullable: true })
  public IdmTen3FFuri?: number;

  @Column("smallint", { nullable: true })
  public IdmDouchuuFuri?: number;

  @Column("smallint", { nullable: true })
  public IdmAgari3FFuri?: number;

  @Column("smallint", { nullable: true })
  public IdmRace?: number;

  @Column("tinyint", { nullable: true })
  public CourseDori?: number;

  @Column("tinyint", { nullable: true })
  public JoushoudoCode?: number;

  @Column("tinyint", { nullable: true })
  public ClassCode?: number;

  @Column("tinyint", { nullable: true })
  public BataiCode?: number;

  @Column("tinyint", { nullable: true })
  public KehaiCode?: number;

  @Column("tinyint", { nullable: true })
  public Pace?: number;

  @Column("real", { nullable: true })
  public Ten3FShisuu?: number;

  @Column("real", { nullable: true })
  public Agari3FShisuu?: number;

  @Column("real", { nullable: true })
  public PaceShisuu?: number;
}