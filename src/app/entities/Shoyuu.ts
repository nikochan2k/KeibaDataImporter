import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

export enum MeishouKubun {
  Full,
  Tanshuku
}

@Entity("Shoyuu")
@Index("IxShoyuu", (m: Shoyuu) => [m.Meishou], { unique: true })
export class Shoyuu {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("tinyint")
  public Kubun: MeishouKubun;

  @Column("varchar", { length: 60 })
  public Meishou: string;

  @Column("tinyint", { nullable: true })
  public BanushiKaiCode: number;
}