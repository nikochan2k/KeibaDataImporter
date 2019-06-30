import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Seisansha")
@Index("IxSeisansha1", (s: Seisansha) => [s.UmaId, s.ShoyuuId], { unique: true })
@Index("IxSeisansha2", (s: Seisansha) => [s.ShoyuuId])
export class Seisansha {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("int")
  public UmaId: number;

  @Column("mediumint")
  public ShoyuuId: number;
}
