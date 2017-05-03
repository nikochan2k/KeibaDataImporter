import {
  Entity, Index, Column, PrimaryColumn, OneToMany, ManyToOne, JoinColumn
} from 'typeorm';
import { Shussouba } from "./Shussouba";
import { ChoukyouTime } from "./ChoukyouTime";

@Entity("Choukyou")
@Index("IxChoukyou", (c: Choukyou) => [c.Shussouba])
export class Choukyou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint", { name: "ShussoubaId" })
  @ManyToOne(() => Shussouba, s => s.ChoukyouList)
  @JoinColumn({ name: "ShussoubaId" })
  public Shussouba: Shussouba;

  @Column("smallint")
  public Bangou: number;

  @Column("smallint")
  public Oikiri: number;

  @Column("string", { length: 12 })
  public Kijousha?: string;

  @Column("date", { nullable: true })
  public Nengappi?: Date;

  @Column("string", { length: 9, nullable: true })
  public Basho?: string;

  @Column("string", { length: 3, nullable: true })
  public ChoukyouCourse?: string;

  @Column("string", { length: 3, nullable: true })
  public ChoukyouBaba?: string;

  @Column("smallint", { nullable: true })
  public Kaisuu?: number;

  @Column("smallint", { nullable: true })
  public IchiDori?: number;

  @Column("string", { length: 9, nullable: true })
  public Ashiiro?: string;

  @Column("smallint", { nullable: true })
  public Yajirushi?: number;

  @Column("string", { length: 60, nullable: true })
  public Reigai?: string;

  @Column("string", { length: 129, nullable: true })
  public Awase?: string;

  @OneToMany(() => ChoukyouTime, ct => ct.Choukyou)
  public ChoukyouTimeList: ChoukyouTime[];
}
