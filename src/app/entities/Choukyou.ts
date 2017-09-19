import {
  Column,
  Entity,
  PrimaryColumn
} from "typeorm";

@Entity("Choukyou")
export class Choukyou {
  @PrimaryColumn("bigint")
  public Id: number;


  @Column("varchar", { length: 7, nullable: true })
  public ChoukyouTanpyou?: string;

  @Column("smallint", { nullable: true })
  public ChoukyouHonsuuCourse?: number;

  @Column("smallint", { nullable: true })
  public ChoukyouHonsuuHanro?: number;

  @Column("smallint", { nullable: true })
  public ChoukyouHonsuuPool?: number;


  @Column("tinyint", { nullable: true })
  public ChoukyouType?: number;

  @Column("tinyint", { nullable: true })
  public Choukyouryou?: number;

  @Column("tinyint", { nullable: true })
  public ChoukyouTsuyosa?: number;

  @Column("tinyint", { nullable: true })
  public ChoukyouCourseMain?: number;

  @Column("tinyint", { nullable: true })
  public ChoukyouCourseHanro?: number;

  @Column("tinyint", { nullable: true })
  public ChoukyouCourseWood?: number;

  @Column("tinyint", { nullable: true })
  public ChoukyouCourseDirt?: number;

  @Column("tinyint", { nullable: true })
  public ChoukyouCourseShiba?: number;

  @Column("tinyint", { nullable: true })
  public ChoukyouCoursePool?: number;

  @Column("tinyint", { nullable: true })
  public ChoukyouCourseShougai?: number;

  @Column("tinyint", { nullable: true })
  public ChoukyouKyori?: number;

  @Column("tinyint", { nullable: true })
  public ChoukyouJuuten?: number;

  @Column("smallint", { nullable: true })
  public OikiriShisuu?: number;

  @Column("smallint", { nullable: true })
  public ShiageShisuu?: number;

  @Column("tinyint", { nullable: true })
  public ChoukyouryouHyouka?: number;

  @Column("tinyint", { nullable: true })
  public ShiageShisuuHenka?: number;

  @Column("varchar", { length: 60, nullable: true })
  public ChoukyouComment?: string;

  @Column("int", { nullable: true })
  public CommentNengappi?: number;

  @Column("tinyint", { nullable: true })
  public ChoukyouHyouka?: number;
}