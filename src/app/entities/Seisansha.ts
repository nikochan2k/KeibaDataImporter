import { Entity, Index, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Uma } from "./Uma";

@Entity("Seisansha")
@Index("IxSeisansha", (s: Seisansha) => [s.SeisanshaMei])
export class Seisansha {
  @PrimaryGeneratedColumn("int")
  public Id: number;

  @Column("string", { length: 60 })
  public SeisanshaMei: string;

  @Column("string", { length: 30 })
  public TanshukuSeisanshaMei: string;

  @OneToMany(() => Uma, u => u.Seisansha)
  public UmaList: Uma[];
}
