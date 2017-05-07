import {
  Entity, Index, Column, PrimaryGeneratedColumn, OneToMany
} from "typeorm";
import { Race } from "./Race";

@Entity("Record")
@Index("IxRecord", (r: Record) => [r.Nengappi, r.Bamei])
export class Record {
  @PrimaryGeneratedColumn("bigint")
  public Id: number;

  @Column("date")
  public Nengappi: Date;

  @Column("float")
  public Time: number;

  @Column("string", { length: 45 })
  public Bamei: string;

  @Column("float")
  public Kinryou: number;

  @Column("string", { length: 12 })
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