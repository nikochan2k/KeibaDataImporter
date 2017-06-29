import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Shussouba } from "./Shussouba";

@Entity("Kijou")
@Index("IxKijou", (k: Kijou) => [k.KishuId, k.ShozokuId, k.MinaraiKubun], { unique: true })
export class Kijou {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("int")
  public KishuId: number;

  @Column("int")
  public ShozokuId: number;

  @Column("smallint")
  public MinaraiKubun: number;

  @OneToMany(() => Shussouba, s => s.Kijou)
  public ShussoubaList: Shussouba[];
}