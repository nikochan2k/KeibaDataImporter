import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn
  } from "typeorm";
import { Race } from "./Race";

@Entity("Record")
@Index("IxRecord", (r: Record) => [r.Nengappi, r.UmaId])
export class Record {
  @PrimaryGeneratedColumn("bigint")
  public Id: number;

  @Column("date")
  public Nengappi: Date;

  @Column("float")
  public Time: number;

  @Column("int")
  public UmaId: number;

  @Column("float")
  public Kinryou: number;

  @Column("int")
  public KishuId: number;

  @Column("smallint")
  public Basho: number;

  @OneToMany(() => Race, r => r.CourseRecord)
  public CourseRecordList: Race[];

  @OneToMany(() => Race, r => r.KyoriRecord)
  public KyoriRecordList: Race[];

  @OneToMany(() => Race, r => r.RaceRecord)
  public RaceRecordList: Race[];
}