import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("ShussoubaKeika")
@Index("IxShussoubaKeika", (sk: ShussoubaKeika) => [sk.RaceKeikaId, sk.ShussoubaId])
export class ShussoubaKeika {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public RaceKeikaId: number;

  @Column("bigint")
  public ShussoubaId: number;

  @Column("tinyint")
  public TateCount: number;

  @Column("tinyint")
  public TateHanareteCount: number;

  @Column("tinyint")
  public TateOokikuHanareteCount: number;

  @Column("tinyint")
  public YokoCount: number;

  @Column("tinyint")
  public YokoHanareteCount: number;
}