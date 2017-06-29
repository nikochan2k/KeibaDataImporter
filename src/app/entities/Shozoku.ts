import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Shozoku")
@Index("IxShozoku", (k: Shozoku) => [k.TouzaiBetsu, k.ShozokuBasho, k.KyuushaId], { unique: true })
export class Shozoku {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("smallint", { nullable: true })
  public TouzaiBetsu?: number;

  @Column("smallint", { nullable: true })
  public ShozokuBasho?: number;

  @Column("int", { nullable: true })
  public KyuushaId?: number;
}