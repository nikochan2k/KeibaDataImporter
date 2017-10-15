import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("TokubetsuMei")
@Index("IxTokubetsuMei", (k: TokubetsuMei) => [k.Name], { unique: true })
export class TokubetsuMei {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("varchar", { length: 75 })
  public Name: string;
}