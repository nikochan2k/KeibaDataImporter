import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("ChoukyoushiComment")
@Index("IxChoukyoushiComment", (k: ChoukyoushiComment) => [k.ChoukyoushiId, k.CommentNyuuryokuNengappi], { unique: true })
export class ChoukyoushiComment {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("mediumint")
  public ChoukyoushiId: number;

  @Column("int")
  public CommentNyuuryokuNengappi: number;

  @Column("varchar", { length: 60 })
  public Comment: string;
}