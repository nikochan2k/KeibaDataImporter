import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Kyuusha } from "./Kyuusha";
import { Record } from "./Record";
import { Shussouba } from "./Shussouba";

@Entity("Kishu")
@Index("IxKishu", (k: Kishu) => [k.TanshukuKishuMei])
export class Kishu {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("string", { length: 12 })
  public TanshukuKishuMei: string;

  @Column("string", { length: 48, nullable: true })
  public KishuMei?: string;

  @Column("int", { nullable: true })
  public KolKishuCode?: number;

  @Column("int", { nullable: true })
  public JrdbKishuCode?: number;

  @Column("string", { length: 72, nullable: true })
  public Furigana?: string;

  @Column("date", { nullable: true })
  public Seinengappi?: Date;

  @Column("smallint", { nullable: true })
  public HatsuMenkyoNen?: number;

  @Column("smallint", { nullable: true })
  public TouzaiBetsu?: number;

  @Column("smallint", { nullable: true })
  public ShozokuBasho?: number;

  @Column("smallint", { nullable: true })
  public ShikakuKubun?: number;

  @Column("smallint", { nullable: true })
  public MinaraiKubun?: number;

  @Column("int", { name: "KyuushaId", nullable: true })
  @ManyToOne(() => Kyuusha, Kyuusha => Kyuusha.KishuList)
  @JoinColumn({ name: "KyuushaId" })
  public Kyuusha?: Kyuusha;

  @OneToMany(() => Shussouba, s => s.Kishu)
  public ShussoubaList: Shussouba[];

  @OneToMany(() => Record, r => r.Kishu)
  public RecordList: Record[];
}