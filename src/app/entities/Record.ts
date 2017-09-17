import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Record")
@Index("IxRecord", (r: Record) => [r.Nengappi, r.UmaId])
export class Record {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("bigint")
  public Nengappi: number;

  @Column("float")
  public Time: number;

  @Column("int")
  public UmaId: number;

  @Column("float")
  public Kinryou: number;

  @Column("bigint")
  public TanshukuKishuMeiId: number;

  @Column("smallint")
  public Basho: number;
}