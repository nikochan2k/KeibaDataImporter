import {
  Entity, Index, Column, PrimaryGeneratedColumn, OneToMany
} from "typeorm";
import { Kishu } from "./Kishu";
import { Uma } from "./Uma";
import { Shussouba } from "./Shussouba";

@Entity("Kyuusha")
@Index("IxKyuusha1", (k: Kyuusha) => [k.KyuushaMei])
@Index("IxKyuusha2", (k: Kyuusha) => [k.KolKyuushaCode])
@Index("IxKyuusha3", (k: Kyuusha) => [k.JrdbKyuushaCode])
export class Kyuusha {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("int", { nullable: true })
  public KolKyuushaCode?: number;

  @Column("int", { nullable: true })
  public JrdbKyuushaCode?: number;

  @Column("string", { length: 48, nullable: true })
  public KyuushaMei?: string;

  @Column("string", { length: 12, nullable: true })
  public TanshukuKyuushaMei?: string;

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
  public RitsuHokuNanBetsu?: number;

  @OneToMany(() => Kishu, k => k.Kyuusha)
  public KishuList: Kishu[];

  @OneToMany(() => Uma, u => u.Kyuusha)
  public KyousoubaList: Uma[];

  @OneToMany(() => Shussouba, s => s.Kyuusha)
  public ShussoubaList: Shussouba[];
}