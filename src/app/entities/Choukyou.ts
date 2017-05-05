import {
  Entity, Index, Column, PrimaryColumn, OneToMany, ManyToOne, JoinColumn
} from 'typeorm';
import { Shussouba } from "./Shussouba";
import { Kishu } from "./Kishu";
import { Uma } from "./Uma";
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

  @Column("smallint", { nullable: true })
  public Noriyaku?: number; // 1:助手 2:調教師 3:本番騎手 4:調教騎手 5:見習

  @Column("int", { name: "KishuId", nullable: true })
  @ManyToOne(() => Kishu, k => k.ShussoubaList)
  @JoinColumn({ name: "KishuId" })
  public Kishu?: Kishu;

  @Column("date", { nullable: true })
  public Nengappi?: Date;

  @Column("string", { length: 9, nullable: true })
  public Basho?: string;

  @Column("string", { length: 3, nullable: true })
  public Course?: string;

  @Column("string", { length: 3, nullable: true })
  public Baba?: string;

  @Column("smallint", { nullable: true })
  public Kaisuu?: number;

  @Column("smallint", { nullable: true })
  public IchiDori?: number;

  @Column("smallint", { nullable: true })
  public Ashiiro?: number; // 0:その他 1:一杯 2:強め 3:馬なり

  @Column("smallint", { nullable: true })
  public Yajirushi?: number; // 1:一変　2:平行 3:下降　4:良化　5:下降気味

  @Column("string", { length: 60, nullable: true })
  public Reigai?: string;

  @Column("string", { length: 129, nullable: true })
  public Awase?: string;

  @Column("smallint", { nullable: true })
  public AwaseKekka?: number; //1:先着 2:同入 3:遅れ

  @Column("int", { name: "AwaseUmaId" })
  @ManyToOne(() => Uma)
  @JoinColumn({ name: "AwaseUmaId" })
  public AwaseUma?: Uma;

  @OneToMany(() => ChoukyouTime, ct => ct.Choukyou)
  public ChoukyouTimeList: ChoukyouTime[];
}
