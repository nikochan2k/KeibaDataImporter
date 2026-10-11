import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("ShussoubaHyouka")
export class ShussoubaHyouka {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("smallint", { nullable: true })
  public KolRecordShisuu?: number;

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

  @Column("tinyint", { nullable: true })
  public Kyakushitsu?: number;

  @Column("tinyint", { nullable: true })
  public PaceNagare?: number;

  @Column("varchar", { length: 60, nullable: true })
  public PaddockComment?: string;

  @Column("varchar", { length: 60, nullable: true })
  public AshimotoComment?: string;

  @Column("varchar", { length: 60, nullable: true })
  public BaguSonotaComment?: string;

  @Column("varchar", { length: 60, nullable: true })
  public RaceComment?: string;

  /* KD3 出馬表出走馬データ(調教) */

  @Column("varchar", { length: 12, nullable: true })
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

  /** 一週前追切の指数 */
  @Column("smallint", { nullable: true })
  public IsshuumaeOikiriShisuu?: number;

  /** 一週前追切の調教場所・コース(CHA の追切と同じコード表) */
  @Column("tinyint", { nullable: true })
  public IsshuumaeOikiriBasho?: number;

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
  public ChoukyouCommentNengappi?: number;

  @Column("tinyint", { nullable: true })
  public ChoukyouHyouka?: number;
}
