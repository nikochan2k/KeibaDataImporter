import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("ShussoubaBagu")
@Index("IxShussoubaBagu", (sb: ShussoubaBagu) => [sb.ShussoubaId])
export class ShussoubaBagu {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public ShussoubaId: number;

  @Column("smallint")
  public BaguShubetsu: number;

  @Column("smallint")
  public Bagu: number;
}