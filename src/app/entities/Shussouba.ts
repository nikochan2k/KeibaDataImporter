import {
  Entity, Index, Column, PrimaryColumn, OneToOne, OneToMany, ManyToOne, JoinColumn
} from 'typeorm';
import { Race } from "./Race";
import { Kishu } from "./Kishu";
import { Uma } from "./Uma";
import { Choukyou } from "./Choukyou";
import { ShussoubaFuka } from "./ShussoubaFuka";
import { ShussoubaTsuukaJuni } from "./ShussoubaTsuukaJuni";
import { ShussoubaHassouJoukyou } from "./ShussoubaHassouJoukyou";
import { ShussoubaKeika } from "./ShussoubaKeika";

@Entity("Shussouba")
@Index("IxShussouba1", (s: Shussouba) => [s.Race, s.Umaban])
@Index("IxShussouba2", (s: Shussouba) => [s.Time])
@Index("IxShussouba3", (s: Shussouba) => [s.Zenhan3F])
@Index("IxShussouba4", (s: Shussouba) => [s.Kouhan3F])
@Index("IxShussouba5", (s: Shussouba) => [s.Kyousouba])
@Index("IxShussouba6", (s: Shussouba) => [s.Kishu])
export class Shussouba {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint", { name: "RaceId" })
  @ManyToOne(() => Race, r => r.ShussoubaList)
  @JoinColumn({ name: "RaceId" })
  public Race: Race;

  @Column("smallint")
  public Wakuban: number;

  @Column("smallint")
  public Umaban: number;

  @Column("smallint")
  public Gate: number;

  @Column("int", { name: "KyousoubaId" })
  @ManyToOne(() => Uma, u => u.ShussoubaList)
  @JoinColumn({ name: "KyousoubaId" })
  public Kyousouba: Uma;

  @Column("smallint")
  public Nenrei: number;

  @Column("smallint", { nullable: true })
  public Blinker: number;

  @Column("float", { nullable: true })
  public Kinryou: number;

  @Column("smallint", { nullable: true })
  public Bataijuu: number;

  @Column("smallint", { nullable: true })
  public Zougen: number;

  @Column("smallint", { nullable: true })
  public RecordShisuu: number;

  @Column("int", { name: "KishuId" })
  @ManyToOne(() => Kishu, k => k.ShussoubaList)
  @JoinColumn({ name: "KishuId" })
  public Kishu: Kishu;

  @Column("smallint", { nullable: true })
  public Norikawari?: number;

  @Column("smallint", { nullable: true })
  public YosouShirushi?: number;

  @Column("smallint", { nullable: true })
  public YosouShirushiHonshi?: number;

  @Column("smallint", { nullable: true })
  public Ninki?: number;

  @Column("float", { nullable: true })
  public Odds?: number;

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

  @Column("float", { nullable: true })
  public Time?: number;

  @Column("smallint", { nullable: true })
  public Chakusa1?: number;

  @Column("smallint", { nullable: true })
  public Chakusa2?: number;

  @Column("float", { nullable: true })
  public TimeSa?: number;

  @Column("float", { nullable: true })
  public Zenhan3F?: number;

  @Column("float", { nullable: true })
  public Kouhan3F?: number;

  @Column("smallint", { nullable: true })
  public YonCornerIchiDori?: number;

  @Column("date", { nullable: true })
  public ShutsubahyouSakuseiNengappi?: Date;

  @Column("date", { nullable: true })
  public SeisekiSakuseiNengappi?: Date;

  @OneToOne(() => ShussoubaFuka, sf => sf.Shussouba)
  public ShussoubaFuka: ShussoubaFuka;

  @OneToMany(() => Choukyou, c => c.Shussouba)
  public ChoukyouList: Choukyou[];

  @OneToMany(() => ShussoubaTsuukaJuni, stj => stj.Shussouba)
  public ShussoubaTsuukaJuniList: ShussoubaTsuukaJuni[];

  @OneToMany(() => ShussoubaHassouJoukyou, shj => shj.Shussouba)
  public ShussoubaHassouJoukyouList: ShussoubaHassouJoukyou[];

  @OneToMany(() => ShussoubaKeika, sk => sk.Shussouba)
  public ShussoubaKeikaList: ShussoubaKeika[];
}
