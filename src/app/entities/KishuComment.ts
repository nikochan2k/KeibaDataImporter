import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("KishuComment")
@Index("IxKishuComment", (k: KishuComment) => [k.KishuId, k.CommentNyuuryokuNengappi], { unique: true })
export class KishuComment {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("bigint")
  public KishuId: number;

  @Column("int")
  public CommentNyuuryokuNengappi: number;

  @Column("varchar", { length: 60 })
  public Comment: string;
}