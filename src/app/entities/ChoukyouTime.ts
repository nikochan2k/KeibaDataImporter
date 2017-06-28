import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("ChoukyouTime")
@Index("IxChoukyouTime", (c: ChoukyouTime) => [c.ChoukyouId])
export class ChoukyouTime {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public ChoukyouId: number;

  @Column("smallint")
  public F: number;

  @Column("float", { nullable: true })
  public Time?: number;

  @Column("varchar", { nullable: true })
  public Comment?: string;
}
