import {
  EmbeddableEntity, Column
} from "typeorm";

@EmbeddableEntity()
export class RaceYosou {
  @Column("float", { nullable: true })
  public SuiteiTimeRyou?: number;

  @Column("float", { nullable: true })
  public SuiteiTimeOmoFuryou?: number;

  @Column("smallint", { nullable: true })
  public YosouPace?: number;

  @Column("date", { nullable: true })
  public ShutsubahyouSakuseiNengappi?: Date;

  @Column("string", { nullable: true })
  public RaceTanpyou?: string;

  @Column("string", { nullable: true, length: 18 })
  public Yosoushamei2: string;

}
