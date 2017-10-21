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

  @Column("int")
  public KishuId: number;

  @Column("int", { nullable: true })
  public KishuRirekiId: number;

  @Column("smallint", { nullable: true })
  public Norikawari?: number;

  @Column("smallint", { nullable: true })
  public KakuteiChakujun?: number;

  @Column("smallint", { nullable: true })
  public ChakujunFuka?: number;

  @Column("smallint", { nullable: true })
  public NyuusenChakujun?: number;

  @Column("smallint", { nullable: true })
  public TorikeshiShubetsu?: number;

  @Column("smallint", { nullable: true })
  public RecordNinshiki?: number;

  @Column("real", { nullable: true })
  public Time?: number;

  @Column("smallint", { nullable: true })
  public Chakusa1?: number;

  @Column("smallint", { nullable: true })
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

  @Column("smallint", { nullable: true })
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
}