import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

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
}