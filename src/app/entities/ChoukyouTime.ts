import { Column, Entity, PrimaryColumn } from "typeorm";

/** 調教のハロンごとの時計。主キーは (調教ID, ハロン) */
@Entity("ChoukyouTime")
export class ChoukyouTime {
  @PrimaryColumn("bigint")
  public ChoukyouId: number;

  @PrimaryColumn("tinyint")
  public F: number;

  @Column("real", { nullable: true })
  public Time?: number;

  @Column("varchar", { nullable: true })
  public Comment?: string;
}
