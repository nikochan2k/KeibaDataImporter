import {
  Column,
  Entity,
  PrimaryColumn
} from "typeorm";

@Entity("Choukyou")
export class Choukyou {
  @PrimaryColumn("bigint")
  public Id: number;


  @Column("varchar", { length: 7, nullable: true })
  public ChoukyouTanpyou?: string;

  @Column("smallint", { nullable: true })
  public ChoukyouHonsuuCourse?: number;

  @Column("smallint", { nullable: true })
  public ChoukyouHonsuuHanro?: number;

  @Column("smallint", { nullable: true })
  public ChoukyouHonsuuPool?: number;
}