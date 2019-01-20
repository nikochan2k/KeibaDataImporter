import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("ChoukyoushiMei")
@Index("IxChoukyoushiMei1", (k: ChoukyoushiMei) => [k.ChoukyoushiId, k.JinmeiId], { unique: true })
@Index("IxChoukyoushiMei2", (k: ChoukyoushiMei) => [k.JinmeiId])
export class ChoukyoushiMei {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("mediumint")
  public ChoukyoushiId: number;

  @Column("mediumint")
  public JinmeiId: number;
}