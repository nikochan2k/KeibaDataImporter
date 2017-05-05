import {
  Entity, Column, PrimaryColumn, OneToOne, ManyToOne, JoinColumn
} from "typeorm";
import { Race } from "./Race";
import { Record } from "./Record";

@Entity("RaceFuka")
export class RaceFuka {
  @PrimaryColumn("bigint", { name: "Id" })
  @OneToOne(() => Race, Race => Race.RaceFuka)
  @JoinColumn({ name: "Id" })
  public Race: Race;

  @Column("float", { nullable: true })
  public SuiteiTimeRyou?: number;

  @Column("float", { nullable: true })
  public SuiteiTimeOmoFuryou?: number;

  @Column("smallint", { nullable: true })
  public YosouPace?: number;

  @Column("date", { nullable: true })
  public ShutsubahyouSakuseiNengappi?: Date;

  @Column("string", { nullable: true })
  public RaceTanpyou?: string;

  @Column("string", { nullable: true, length: 18 })
  public Yosoushamei2: string;

  @Column("int", { name: "CourseRecordId", nullable: true })
  @ManyToOne(() => Record, r => r.CourseRecordList)
  @JoinColumn({ name: "CourseRecordId" })
  public CourseRecord?: Record;

  @Column("int", { name: "KyoriRecordId", nullable: true })
  @ManyToOne(() => Record, r => r.KyoriRecordList)
  @JoinColumn({ name: "KyoriRecordId" })
  public KyoriRecord?: Record;

  @Column("int", { name: "RaceRecordId", nullable: true })
  @ManyToOne(() => Record, r => r.RaceRecordList)
  @JoinColumn({ name: "RaceRecordId" })
  public RaceRecord?: Record;

  @Column("string", { length: 120, nullable: true })
  public HassouJoukyou?: string;

  @Column("text", { nullable: true })
  public SeisaiNaiyou?: string;
}
