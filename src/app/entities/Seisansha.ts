import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Seisansha")
@Index("IxSeisansha", (s: Seisansha) => [s.SeisanshaMei], { unique: true })
export class Seisansha {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("varchar", { length: 60 })
  public SeisanshaMei: string;

  @Column("varchar", { length: 30 })
  public TanshukuSeisanshaMei: string;
}
