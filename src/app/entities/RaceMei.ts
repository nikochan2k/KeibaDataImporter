import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("RaceMei")
@Index("IxRaceMei", (k: RaceMei) => [k.RaceId, k.TokubetsuMeiId], { unique: true })
export class RaceMei {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("int")
  public RaceId: number;

  @Column("mediumint")
  public TokubetsuMeiId: number;
}