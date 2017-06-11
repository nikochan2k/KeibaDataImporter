import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
  } from "typeorm";
import { Kishu } from "./Kishu";
import { Race } from "./Race";
import { Uma } from "./Uma";

@Entity("Record")
@Index("IxRecord", (r: Record) => [r.Nengappi, r.Kyousouba])
export class Record {
  @PrimaryGeneratedColumn("bigint")
  public Id: number;

  @Column("date")
  public Nengappi: Date;

  @Column("float")
  public Time: number;

  @Column("int", { name: "KyousoubaId" })
  @ManyToOne(() => Uma, u => u.RecordList)
  @JoinColumn({ name: "KyousoubaId" })
  public Kyousouba: Uma;

  @Column("float")
  public Kinryou: number;

  @Column("int", { name: "KishuId" })
  @ManyToOne(() => Kishu, k => k.RecordList)
  @JoinColumn({ name: "KishuId" })
  public Kishu: Kishu;

  @Column("smallint")
  public Basho: number;

  @OneToMany(() => Race, r => r.CourseRecord)
  public CourseRecordList: Race[];

  @OneToMany(() => Race, r => r.KyoriRecord)
  public KyoriRecordList: Race[];

  @OneToMany(() => Race, r => r.RaceRecord)
  public RaceRecordList: Race[];
}