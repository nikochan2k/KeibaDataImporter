import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("TokubetsuMei")
@Index("IxTokubetsuMei", (k: TokubetsuMei) => [k.Meishou], { unique: true })
export class TokubetsuMei {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("varchar", { length: 75 })
  public Meishou: string;
}