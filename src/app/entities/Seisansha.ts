import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Uma } from "./Uma";

@Entity("Seisansha")
@Index("IxSeisansha", (s: Seisansha) => [s.SeisanshaMei], { unique: true })
export class Seisansha {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("varchar", { length: 60 })
  public SeisanshaMei: string;

  @Column("varchar", { length: 30 })
  public TanshukuSeisanshaMei: string;

  @OneToMany(() => Uma, u => u.Seisansha)
  public UmaList: Uma[];
}
