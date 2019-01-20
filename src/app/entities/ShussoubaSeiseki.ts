import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("ShussoubaSeiseki")
@Index("IxShussoubaSeiseki1", (s: ShussoubaSeiseki) => [s.Time])
@Index("IxShussoubaSeiseki2", (s: ShussoubaSeiseki) => [s.Ten3F])
@Index("IxShussoubaSeiseki3", (s: ShussoubaSeiseki) => [s.Agari3F])
@Index("IxShussoubaSeiseki4", (s: ShussoubaSeiseki) => [s.KishuId])
export class ShussoubaSeiseki {
  @PrimaryColumn("bigint")
  public Id: number;

  /* KOL 競走成績出走馬データ */

  @Column("smallint", { nullable: true })
  public Gate?: number;

  @Column("real", { nullable: true })
  public Kinryou?: number;

  @Column("smallint", { nullable: true })
  public Bataijuu?: number;

  @Column("smallint", { nullable: true })
  public Zougen?: number;

  @Column("mediumint")
  public KishuId: number;

  @Column("tinyint", { nullable: true })
  public KishuTouzaiBetsu: number;

  @Column("tinyint", { nullable: true })
  public KishuShozokuBasho?: number;

  @Column("mediumint", { nullable: true })
  public KishuShozokuKyuushaId: number;

  @Column("tinyint", { nullable: true })
  public MinaraiKubun: number;

  @Column("tinyint", { nullable: true })
  public Norikawari?: number;

  @Column("tinyint", { nullable: true })
  public KakuteiChakujun?: number;

  @Column("tinyint", { nullable: true })
  public ChakujunFuka?: number;

  @Column("tinyint", { nullable: true })
  public NyuusenChakujun?: number;

  @Column("tinyint", { nullable: true })
  public TorikeshiShubetsu?: number;

  @Column("tinyint", { nullable: true })
  public RecordNinshiki?: number;

  @Column("real", { nullable: true })
  public Time?: number;

  @Column("tinyint", { nullable: true })
  public Chakusa1?: number;

  @Column("tinyint", { nullable: true })
  public Chakusa2?: number;

  @Column("real", { nullable: true })
  public TimeSa?: number;

  @Column("real", { nullable: true })
  public Ten3F?: number;

  @Column("real", { nullable: true })
  public Ten3FIkou?: number;

  @Column("real", { nullable: true })
  public Douchuu?: number;

  @Column("real", { nullable: true })
  public Agari3FIzen?: number;

  @Column("real", { nullable: true })
  public Agari3F?: number;

  @Column("tinyint", { nullable: true })
  public YonCornerIchiDori?: number;

  /* KOL 騎手厩舎コメント／次走へのメモ */

  @Column("text", { nullable: true })
  public KishuKyuushaComment: string;

  @Column("text", { nullable: true })
  public JisouhenoMemo: string;

  /* JRDB 成績データ */

  @Column("int", { nullable: true })
  public HonShoukin?: number;

  @Column("int", { nullable: true })
  public ShuutokuShoukin?: number;


  @Column("int", { nullable: true })
  public KolNengappi: number;
}