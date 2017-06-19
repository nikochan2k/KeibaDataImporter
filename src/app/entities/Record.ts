import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn
  } from "typeorm";
import { Race } from "./Race";

@Entity("Record")
@Index("IxRecord", (r: Record) => [r.Nengappi, r.Kyousouba])
export class Record {
  @PrimaryGeneratedColumn("bigint")
  public Id: number;

  @Column("date")
  public Nengappi: Date;

  @Column("float")
  public Time: number;

  @Column("varchar", { length: 54 })
  public Kyousouba: string;

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