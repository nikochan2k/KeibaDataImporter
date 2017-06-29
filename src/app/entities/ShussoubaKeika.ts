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

  @Column("smallint")
  public TateCount: number;

  @Column("smallint")
  public TateHanareteCount: number;

  @Column("smallint")
  public TateOokikuHanareteCount: number;

  @Column("smallint")
  public YokoCount: number;
}