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

@Entity("Jinmei")
@Index("IxJinmei", (k: Jinmei) => [k.Name], { unique: true })
export class Jinmei {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("tinyint")
  public Kubun: Kubun;

  @Column("varchar", { length: 48 })
  public Name: string;
}