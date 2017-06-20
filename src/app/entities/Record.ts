import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
  } from "typeorm";
import { Race } from "./Race";
import { Uma } from "./Uma";

@Entity("Record")
@Index("IxRecord", (r: Record) => [r.Nengappi, r.Uma])
export class Record {
  @PrimaryGeneratedColumn("bigint")
  public Id: number;

  @Column("date")
  public Nengappi: Date;

  @Column("float")
  public Time: number;

  @Column("int", { name: "UmaId" })
  @ManyToOne(() => Uma, u => u.RecordList)
  @JoinColumn({ name: "UmaId" })
  public Uma: Uma;

  @Column("float")
  public Kinryou: number;

  @Column("varchar", { length: 12 })
  public TanshukuKishuMei: string;

  @Column("smallint")
  public Basho: number;

  @OneToMany(() => Race, r => r.CourseRecord)
  public CourseRecordList: Race[];

  @OneToMany(() => Race, r => r.KyoriRecord)
  public KyoriRecordList: Race[];

  @OneToMany(() => Race, r => r.RaceRecord)
  public RaceRecordList: Race[];
}