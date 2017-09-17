import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Meishou")
@Index("IxMeishou", (k: Meishou) => [k.Namae], { unique: true })
export class Meishou {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("varchar", { length: 48 })
  public Namae: string;
}