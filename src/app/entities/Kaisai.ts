import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("Kaisai")
@Index("IxKaisai1", (r: Kaisai) => [r.Key])
@Index("IxKaisai2", (r: Kaisai) => [r.Basho, r.Kaiji, r.Nichiji])
@Index("IxKaisai3", (r: Kaisai) => [r.Basho, r.Nen, r.Gatsu, r.Nichi])
export class Kaisai {
  @PrimaryColumn("int")
  public Id: number; // 22ビット

  @Column("int")
  public Key: number;

  @Column("tinyint")
  public Basho: number;

  @Column("smallint")
  public Nen: number;

  @Column("tinyint")
  public Gatsu: number;

  @Column("tinyint")
  public Nichi: number;

  @Column("tinyint", { nullable: true })
  public Kaiji?: number;

  @Column("tinyint", { nullable: true })
  public Nichiji?: number;

  @Column("tinyint", { nullable: true })
  public Youbi: number;

  @Column("tinyint", { nullable: true })
  public Kyuujitsu?: number;

  @Column("tinyint", { nullable: true })
  public KaisaiKubun?: number;

  @Column("tinyint", { nullable: true })
  public ChuuouChihouGaikoku?: number;

  @Column("varchar", { nullable: true, length: 30 })
  public GaikokuKeibajouMei: string;
}
