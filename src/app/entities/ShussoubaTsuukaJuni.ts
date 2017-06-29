import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("ShussoubaTsuukaJuni")
@Index("IxShussoubaTsuukaJuni", (stj: ShussoubaTsuukaJuni) => [stj.ShussoubaId])
export class ShussoubaTsuukaJuni {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public ShussoubaId: number;

  @Column("smallint")
  public Bangou: number;

  @Column("smallint", { nullable: true })
  public Juni?: number;

  @Column("smallint", { nullable: true })
  public Joukyou?: number;
}