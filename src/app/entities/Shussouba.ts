import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("Shussouba")
@Index("IxShussouba1", (s: Shussouba) => [s.RaceId, s.Umaban])
@Index("IxShussouba2", (s: Shussouba) => [s.Time])
@Index("IxShussouba3", (s: Shussouba) => [s.Ten3F])
@Index("IxShussouba4", (s: Shussouba) => [s.Agari3F])
@Index("IxShussouba5", (s: Shussouba) => [s.KyousoubaId])
@Index("IxShussouba6", (s: Shussouba) => [s.KishuId])
export class Shussouba {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("smallint", { nullable: true })
  public Wakuban?: number;

  @Column("smallint")
  public Umaban: number;

  @Column("smallint", { nullable: true })
  public Gate?: number;

  @Column("int", { nullable: true })
  public KyousoubaId: number;

  @Column("smallint")
  public Nenrei: number;

  @Column("smallint", { nullable: true })
  public Blinker?: number;

  @Column("real", { nullable: true })
  public Kinryou?: number;

  @Column("smallint", { nullable: true })
  public Bataijuu?: number;

  @Column("smallint", { nullable: true })
  public Zougen?: number;

  @Column("smallint", { nullable: true })
  public KolRecordShisuu?: number;

  @Column("int")
  public KishuId: number;

  @Column("smallint", { nullable: true })
  public KishuTouzaiBetsu?: number;

  @Column("smallint", { nullable: true })
  public KishuShozokuBasho?: number;

  @Column("int", { nullable: true })
  public KishuShozokuKyuushaId?: number;

  @Column("smallint", { nullable: true })
  public MinaraiKubun: number;

  @Column("smallint", { nullable: true })
  public Norikawari?: number;

  @Column("smallint", { nullable: true })
  public Ninki?: number;

  @Column("real", { nullable: true })
  public Odds?: number;

  @Column("smallint", { nullable: true })
  public FukushouNinki?: number;

  @Column("real", { nullable: true })
  public FukushouOdds?: number;

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

  @Column("smallint", { nullable: true })
  public KyuuyouRiyuuCode?: number;

  @Column("varchar", { length: 90, nullable: true })
  public KyuuyouRiyuu?: string;

  @Column("text", { nullable: true })
  public KishuKyuushaComment: string;

  @Column("text", { nullable: true })
  public JisouhenoMemo: string;

  @Column("bigint", { nullable: true })
  public KolShutsubahyouSakuseiNengappi?: number;

  @Column("bigint", { nullable: true })
  public KolSeisekiSakuseiNengappi?: number;

}