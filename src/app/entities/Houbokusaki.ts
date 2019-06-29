import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Houbokusaki")
@Index("IxHoubokusaki", (h: Houbokusaki) => [h.Meishou], { unique: true })
export class Houbokusaki {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("varchar", { length: 75 })
  public Meishou: string;
}