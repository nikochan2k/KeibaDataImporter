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

  @Column("int")
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

  @Column("mediumint", { nullable: true })
  public KishuId: number;

  @Column("tinyint", { nullable: true })
  public KishuTouzaiBetsu: number;

  @Column("tinyint", { nullable: true })
  public KishuShozokuBasho?: number;

  @Column("mediumint", { nullable: true })
  public KishuShozokuChoukyoushiId: number;

  @Column("tinyint", { nullable: true })
  public MinaraiKubun: number;

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


  @Column("int", { nullable: true })
  public KolNengappi: number;

  @Column("tinyint", { nullable: true })
  public Jrdb: number;
}