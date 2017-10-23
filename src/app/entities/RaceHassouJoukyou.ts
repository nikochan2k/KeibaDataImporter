import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("RaceHassouJoukyou")
@Index("IxRaceHassouJoukyou", (rhj: RaceHassouJoukyou) => [rhj.RaceId])
export class RaceHassouJoukyou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceId: number;

  @Column("varchar", { length: 120 })
  public HassouJoukyou;

  @Column("tinyint")
  public Ichi: number;

  @Column("tinyint")
  public Joukyou: number;

  @Column("real", { nullable: true })
  public FuriBashin?: number;

  @Column("real", { nullable: true })
  public FuriByou?: number;
}
