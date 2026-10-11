import { Column, Entity, Index, PrimaryColumn } from "typeorm";

/**
 * 出走馬と調教の連関。同じ調教が複数のレースの出馬表・成績に出てくるため、
 * レース(出走馬)ごとに変わる項目はこちらに持つ。
 * Id = 出走馬Id * 2^3 + 出走馬ごとの連番(0〜7)
 */
@Entity("ShussoubaChoukyou")
@Index("IxShussoubaChoukyou1", (sc: ShussoubaChoukyou) => [sc.ShussoubaId])
@Index("IxShussoubaChoukyou2", (sc: ShussoubaChoukyou) => [sc.ChoukyouId])
export class ShussoubaChoukyou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public ShussoubaId: number;

  @Column("bigint")
  public ChoukyouId: number;

  /** KOL の調教フラグ 0:前回 1:追切り */
  @Column("tinyint", { nullable: true })
  public ChoukyouFlag?: number;

  @Column("tinyint", { nullable: true })
  public Yajirushi?: number; // 1:一変　2:平行 3:下降　4:良化　5:下降気味

  @Column("varchar", { length: 60, nullable: true })
  public Reigai?: string;

  /** JRDB の本追切 1:本追切 */
  @Column("tinyint", { nullable: true })
  public HonOikiri?: number;
}
