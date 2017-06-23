import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
  } from "typeorm";
import { Kijou } from "./Kijou";
import { Kyuusha } from "./Kyuusha";

@Entity("Shozoku")
@Index("IxShozoku", (k: Shozoku) => [k.TouzaiBetsu, k.ShozokuBasho, k.Kyuusha], { unique: true })
export class Shozoku {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("smallint", { nullable: true })
  public TouzaiBetsu?: number;

  @Column("smallint", { nullable: true })
  public ShozokuBasho?: number;

  @Column("int", { name: "KyuushaId", nullable: true })
  @ManyToOne(() => Kyuusha, Kyuusha => Kyuusha.ShozokuList)
  @JoinColumn({ name: "KyuushaId" })
  public Kyuusha?: Kyuusha;

  @OneToMany(() => Kijou, k => k.Kishu)
  public KijouList: Kijou[];
}