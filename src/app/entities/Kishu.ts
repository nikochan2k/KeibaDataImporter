import {
  Entity, Index, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn
} from "typeorm";
import { Shussouba } from "./Shussouba";
import { Kyuusha } from "./Kyuusha";

@Entity("Kishu")
@Index("IxKishu1", (k: Kishu) => [k.KishuCode])
@Index("IxKishu2", (k: Kishu) => [k.KishuMei])
@Index("IxKishu3", (k: Kishu) => [k.TanshukuKishuMei])
export class Kishu {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("int", { nullable: true })
  public KishuCode: number;

  @Column("string", { length: 48, nullable: true })
  public KishuMei: string;

  @Column("string", { length: 12 })
  public TanshukuKishuMei: string;

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

  @Column("int", { name: "KyuushaId" })
  @ManyToOne(() => Kyuusha, Kyuusha => Kyuusha.KishuList)
  @JoinColumn({ name: "KishuId" })
  public Kyuusha?: Kyuusha;

  @Column("smallint", { nullable: true })
  public MasshouFlag?: number;

  @Column("date", { nullable: true })
  public DataSakuseiNengappi?: Date;

  @OneToMany(() => Shussouba, s => s.Kishu)
  public ShussoubaList: Shussouba[];
}