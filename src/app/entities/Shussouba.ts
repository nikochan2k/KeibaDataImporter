import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("Shussouba")
@Index("IxShussouba1", (s: Shussouba) => [s.RaceId, s.Umaban])
@Index("IxShussouba2", (s: Shussouba) => [s.KyousoubaId])
@Index("IxShussouba3", (s: Shussouba) => [s.KishuId])
export class Shussouba {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  /* KOL 出馬表出走馬データ／競走成績出走馬データ */

  @Column("tinyint", { nullable: true })
  public Wakuban?: number;

  @Column("tinyint")
  public Umaban: number;

  @Column("int", { nullable: true })
  public KyousoubaId: number;

  @Column("tinyint", { nullable: true })
  public Nenrei: number;

  @Column("real", { nullable: true })
  public Kinryou?: number;

  @Column("int", { nullable: true })
  public KishuId: number;

  @Column("int", { nullable: true })
  public KishuRirekiId: number;

  @Column("smallint", { nullable: true })
  public Norikawari?: number;

  /* JRDB 競走馬データ */

  @Column("smallint", { nullable: true })
  public Bataijuu?: number;

  @Column("tinyint", { nullable: true })
  public Zougen?: number;

  @Column("tinyint", { nullable: true })
  public TorikeshiShubetsu?: number;

  /* KOL 競走成績出走馬データ */

  @Column("tinyint", { nullable: true })
  public KyuuyouRiyuuCode?: number;

  @Column("varchar", { length: 90, nullable: true })
  public KyuuyouRiyuu?: string;

  /* KOL 騎手厩舎コメント／次走へのメモ */

  @Column("text", { nullable: true })
  public KishuKyuushaComment: string;

  @Column("text", { nullable: true })
  public JisouhenoMemo: string;


  @Column("int", { nullable: true })
  public KolDenNengappi: number;

  @Column("int", { nullable: true })
  public KolSeiNengappi: number;

  @Column("int", { nullable: true })
  public JrdbDenNengappi: number;

  @Column("int", { nullable: true })
  public JrdbSeiNengappi: number;
}