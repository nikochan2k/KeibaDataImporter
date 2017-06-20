import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn
  } from "typeorm";
import { KishuShozoku } from "./KishuShozoku";
import { KyousoubaRireki } from "./KyousoubaRireki";

@Entity("Kyuusha")
@Index("IxKyuusha1", (k: Kyuusha) => [k.KyuushaMei], { unique: true })
@Index("IxKyuusha2", (k: Kyuusha) => [k.KolKyuushaCode], { unique: true })
@Index("IxKyuusha3", (k: Kyuusha) => [k.JrdbKyuushaCode], { unique: true })
export class Kyuusha {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("int", { nullable: true })
  public KolKyuushaCode?: number;

  @Column("int", { nullable: true })
  public JrdbKyuushaCode?: number;

  @Column("varchar", { length: 48, nullable: true })
  public KyuushaMei?: string;

  @Column("varchar", { length: 12, nullable: true })
  public TanshukuKyuushaMei?: string;

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
  public RitsuHokuNanBetsu?: number;

  @OneToMany(() => KishuShozoku, ks => ks.Kyuusha)
  public KishuShozokuList: KishuShozoku[];

  @OneToMany(() => KyousoubaRireki, kr => kr.Kyuusha)
  public KyousoubaRirekiList: KyousoubaRireki[];
}