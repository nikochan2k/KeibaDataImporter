import {
  Entity, Index, Column, PrimaryGeneratedColumn, OneToMany
} from "typeorm";
import { RaceFuka } from "./RaceFuka";

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

  @OneToMany(() => RaceFuka, rf => rf.CourseRecord)
  public CourseRecordList: RaceFuka[];

  @OneToMany(() => RaceFuka, rf => rf.KyoriRecord)
  public KyoriRecordList: RaceFuka[];

  @OneToMany(() => RaceFuka, rf => rf.RaceRecord)
  public RaceRecordList: RaceFuka[];
}