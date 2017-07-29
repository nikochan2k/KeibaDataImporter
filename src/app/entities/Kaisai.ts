import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("Kaisai")
@Index("IxKaisai1", (r: Kaisai) => [r.Basho, r.Kaiji, r.Nichiji])
@Index("IxKaisai2", (r: Kaisai) => [r.Basho, r.Nengappi])
export class Kaisai {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("smallint")
  public Basho: number;

  @Column("smallint")
  public Nen: number;

  @Column("smallint", { nullable: true })
  public Kaiji?: number;

  @Column("smallint", { nullable: true })
  public Nichiji?: number;

  @Column("bigint", { nullable: true })
  public Nengappi?: number;

  @Column("smallint", { nullable: true })
  public Youbi: number;

  @Column("smallint", { nullable: true })
  public Kyuujitsu?: number;

  @Column("smallint", { nullable: true })
  public KaisaiKubun?: number;

  @Column("smallint", { nullable: true })
  public ChuuouChihouGaikoku?: number;

  @Column("varchar", { nullable: true, length: 30 })
  public GaikokuKeibajouMei: string;
}
