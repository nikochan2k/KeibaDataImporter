import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

export enum Kubun {
  Full,
  Tanshuku
}

@Entity("Meishou")
@Index("IxMeishou", (m: Meishou) => [m.Name], { unique: true })
export class Meishou {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("tinyint")
  public Kubun: Kubun;

  @Column("varchar", { length: 60 })
  public Name: string;

  @Column("tinyint", { nullable: true })
  public BanushiKaiCode: number;
}