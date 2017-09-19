import {
  Column,
  Entity,
  PrimaryColumn
} from "typeorm";

@Entity("Choukyou")
export class Choukyou {
  @PrimaryColumn("bigint")
  public Id: number;

  /* KD3 出馬表出走馬データ */

  @Column("varchar", { length: 7, nullable: true })
  public ChoukyouTanpyou?: string;

  @Column("smallint", { nullable: true })
  public ChoukyouHonsuuCourse?: number;

  @Column("smallint", { nullable: true })
  public ChoukyouHonsuuHanro?: number;

  @Column("smallint", { nullable: true })
  public ChoukyouHonsuuPool?: number;

  /* JRDB 調教分析データ */

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
  public ChoukyouCoursePoly?: number;

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

  /* JRDB 調教本追切データ */

  @Column("int", { nullable: true })
  public ChoukyouNengappi?: number;

  @Column("tinyint", { nullable: true })
  public Kaisuu?: number;

  @Column("tinyint", { nullable: true })
  public Basho?: number;

  @Column("tinyint", { nullable: true })
  public Type?: number;

  @Column("tinyint", { nullable: true })
  public Oikiri?: number;

  @Column("tinyint", { nullable: true })
  public OiJoutai?: number;

  @Column("tinyint", { nullable: true })
  public Noriyaku?: number;

  @Column("tinyint", { nullable: true })
  public ChoukyouF?: number;

  // 時計分析データ

  @Column("smallint", { nullable: true })
  public TenF?: number;

  @Column("smallint", { nullable: true })
  public ChuukanF?: number;

  @Column("smallint", { nullable: true })
  public ShimaiF?: number;

  @Column("smallint", { nullable: true })
  public TenFShisuu?: number;

  @Column("smallint", { nullable: true })
  public ChuukanFShisuu?: number;

  @Column("smallint", { nullable: true })
  public ShimaiFShisuu?: number;

  // 併せ馬相手データ

  @Column("tinyint", { nullable: true })
  public Awasekekka?: number;

  @Column("tinyint", { nullable: true })
  public AwaseumaOikiriShurui?: number;

  @Column("tinyint", { nullable: true })
  public AwaseumaNenrei?: number;

  @Column("tinyint", { nullable: true })
  public AwaseumaClass?: number;
}