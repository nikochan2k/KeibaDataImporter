import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Seisansha")
@Index("IxSeisansha1", (s: Seisansha) => [s.UmaId, s.MeishouId], { unique: true })
@Index("IxSeisansha2", (s: Seisansha) => [s.MeishouId])
export class Seisansha {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("int")
  public UmaId: number;

  @Column("mediumint")
  public MeishouId: number;
}
