import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

export enum Kubun {
  Seimei,
  Tanshuku,
  Furigana
}

@Entity("Meishou")
@Index("IxMeishou", (k: Meishou) => [k.Name], { unique: true })
export class Meishou {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("tinyint")
  public Kubun: Kubun;

  @Column("varchar", { length: 48 })
  public Name: string;
}