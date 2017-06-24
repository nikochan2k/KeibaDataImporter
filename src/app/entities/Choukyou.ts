import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn
} from "typeorm";
import { ChoukyouTime } from "./ChoukyouTime";
import { Kishu } from "./Kishu";
import { Shussouba } from "./Shussouba";
import { Uma } from "./Uma";

@Entity("Choukyou")
@Index("IxChoukyou", (c: Choukyou) => [c.Shussouba])
export class Choukyou {
  @PrimaryColumn("bigint")
  public Id: number;

  @ManyToOne(() => Shussouba, s => s.ChoukyouList)
  @JoinColumn({ name: "ShussoubaId" })
  public Shussouba: Shussouba;

  @Column("smallint")
  public Bangou: number;

  @Column("smallint", { nullable: true })
  public ChoukyouFlag?: number;

  @Column("smallint", { nullable: true })
  public Noriyaku?: number;

  @ManyToOne(() => Kishu, k => k.ChoukyouList, { nullable: true })
  @JoinColumn({ name: "KishuId" })
  public Kishu: Kishu;

  @Column("date", { nullable: true })
  public Nengappi?: Date;

  @Column("smallint", { nullable: true })
  public Basho?: number;

  @Column("smallint", { nullable: true })
  public Type?: number;

  @Column("smallint", { nullable: true })
  public Course?: number;

  @Column("varchar", { length: 12, nullable: true })
  public BashoCourse?: string;

  @Column("smallint", { nullable: true })
  public Baba?: number;

  @Column("smallint", { nullable: true })
  public Kaisuu?: number;

  @Column("smallint", { nullable: true })
  public IchiDori?: number;

  @Column("smallint", { nullable: true })
  public Oikiri?: number;

  @Column("smallint", { nullable: true })
  public Ashiiro?: number;

  @Column("varchar", { length: 9, nullable: true })
  public OikiriSonota?: string;

  @Column("smallint", { nullable: true })
  public Yajirushi?: number; // 1:一変　2:平行 3:下降　4:良化　5:下降気味

  @Column("varchar", { length: 60, nullable: true })
  public Reigai?: string;

  @ManyToOne(() => Uma, u => u.ChoukyouList, { nullable: true })
  @JoinColumn({ name: "AwaseUmaId" })
  public AwaseUma?: Uma;

  @Column("smallint", { nullable: true })
  public AwaseKekka?: number;

  @Column("smallint", { nullable: true })
  public Chakusa?: number;

  @Column("float", { nullable: true })
  public TimeSa?: number;

  @Column("varchar", { length: 129, nullable: true })
  public AwaseReigai?: string;

  @OneToMany(() => ChoukyouTime, ct => ct.Choukyou)
  public ChoukyouTimeList: ChoukyouTime[];
}
