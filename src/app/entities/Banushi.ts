import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("Banushi")
@Index("IxBanushi1", (b: Banushi) => [b.ShussoubaId, b.ShoyuuId], { unique: true })
@Index("IxBanushi2", (b: Banushi) => [b.ShoyuuId])
export class Banushi {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("bigint")
  public ShussoubaId: number;

  @Column("mediumint")
  public ShoyuuId: number;
}
