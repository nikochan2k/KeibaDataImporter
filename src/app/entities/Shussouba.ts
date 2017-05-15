import {
  Entity, Index, Column, PrimaryColumn, OneToOne, OneToMany, ManyToOne,
  JoinColumn
} from "typeorm";
import { Race } from "./Race";
import { Kishu } from "./Kishu";
import { Kyuusha } from "./Kyuusha";
import { Uma } from "./Uma";
import { Choukyou } from "./Choukyou";
import { ShussoubaYosou } from "./ShussoubaYosou";
import { ShussoubaTsuukaJuni } from "./ShussoubaTsuukaJuni";
import { ShussoubaKeika } from "./ShussoubaKeika";
import { ShussoubaBagu } from "./ShussoubaBagu";

@Entity("Shussouba")
@Index("IxShussouba1", (s: Shussouba) => [s.Race, s.Umaban])
@Index("IxShussouba2", (s: Shussouba) => [s.Time])
@Index("IxShussouba3", (s: Shussouba) => [s.Ten3F])
@Index("IxShussouba4", (s: Shussouba) => [s.Agari3F])
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
  public Blinker?: number;

  @Column("float", { nullable: true })
  public Kinryou?: number;

  @Column("smallint", { nullable: true })
  public Bataijuu?: number;

  @Column("smallint", { nullable: true })
  public Zougen?: number;

  @Column("int", { name: "KishuId" })
  @ManyToOne(() => Kishu, k => k.ShussoubaList)
  @JoinColumn({ name: "KishuId" })
  public Kishu: Kishu;

  @Column("smallint", { nullable: true })
  public Norikawari?: number;

  @Column("int", { name: "KyuushaId" })
  @ManyToOne(() => Kyuusha, k => k.ShussoubaList)
  @JoinColumn({ name: "KyuushaId" })
  public Kyuusha: Kyuusha;

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
  public Ten3F?: number;

  @Column("float", { nullable: true })
  public Ten3FIkou?: number;

  @Column("float", { nullable: true })
  public Chuukan?: number;

  @Column("float", { nullable: true })
  public Agari3FIzen?: number;

  @Column("float", { nullable: true })
  public Agari3F?: number;

  @Column("smallint", { nullable: true })
  public YonCornerIchiDori?: number;

  @Column("smallint", { nullable: true })
  public KyuuyouRiyuuCode?: number;

  @Column("string", { length: 90, nullable: true })
  public KyuuyouRiyuu?: string;

  @Column("date", { nullable: true })
  public KolShutsubahyouSakuseiNengappi?: Date;

  @Column("date", { nullable: true })
  public KolSeisekiSakuseiNengappi?: Date;

  @Column("date", { nullable: true })
  public JrdbShutsubahyouSakuseiNengappi?: Date;

  @Column("date", { nullable: true })
  public JrdbSeisekiSakuseiNengappi?: Date;

  @OneToOne(() => ShussoubaYosou, sf => sf.Shussouba)
  public ShussoubaYosou: ShussoubaYosou;

  @OneToMany(() => Choukyou, c => c.Shussouba)
  public ChoukyouList: Choukyou[];

  @OneToMany(() => ShussoubaTsuukaJuni, stj => stj.Shussouba)
  public ShussoubaTsuukaJuniList: ShussoubaTsuukaJuni[];

  @OneToMany(() => ShussoubaKeika, sk => sk.Shussouba)
  public ShussoubaKeikaList: ShussoubaKeika[];

  @OneToMany(() => ShussoubaBagu, sb => sb.Shussouba)
  public ShussoubaBaguList: ShussoubaBagu[];
}