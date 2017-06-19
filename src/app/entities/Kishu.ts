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
import { Shussouba } from "./Shussouba";

@Entity("Kishu")
@Index("IxKishu", (k: Kishu) => [k.KishuMei, k.TanshukuKishuMei, k.ShozokuBasho, k.MinaraiKubun], { unique: true })
export class Kishu {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("varchar", { length: 12 })
  public TanshukuKishuMei: string;

  @Column("date")
  public FromDate: Date;

  @Column("date")
  public ToDate: Date;

  @Column("varchar", { length: 48, nullable: true })
  public KishuMei?: string;

  @Column("int", { nullable: true })
  public KolKishuCode?: number;

  @Column("int", { nullable: true })
  public JrdbKishuCode?: number;

  @Column("varchar", { length: 72, nullable: true })
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
  public MinaraiKubun?: number;

  @Column("int", { name: "KyuushaId", nullable: true })
  @ManyToOne(() => Kyuusha, Kyuusha => Kyuusha.KishuList)
  @JoinColumn({ name: "KyuushaId" })
  public Kyuusha?: Kyuusha;

  @OneToMany(() => Shussouba, s => s.Kishu)
  public ShussoubaList: Shussouba[];
}