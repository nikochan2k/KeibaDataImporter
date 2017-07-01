import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("ShussoubaHassouJoukyou")
@Index("IxShussoubaHassouJoukyou", (shj: ShussoubaHassouJoukyou) => [shj.RaceHassouJoukyouId, shj.ShussoubaId])
export class ShussoubaHassouJoukyou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceHassouJoukyouId: number;

  @Column("bigint")
  public ShussoubaId: number;
}