import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Kijou")
@Index("IxKijou", (k: Kijou) => [k.KishuId, k.ShozokuId, k.MinaraiKubun], { unique: true })
export class Kijou {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("int")
  public KishuId: number;

  @Column("int")
  public ShozokuId: number;

  @Column("smallint")
  public MinaraiKubun: number;
}