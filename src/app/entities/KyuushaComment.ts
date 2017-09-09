import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("KyuushaComment")
@Index("IxKyuushaComment", (k: KyuushaComment) => [k.KyuushaId, k.CommentNyuuryokuNengappi], { unique: true })
export class KyuushaComment {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("bigint")
  public KyuushaId: number;

  @Column("int")
  public CommentNyuuryokuNengappi: number;

  @Column("varchar", { length: 60 })
  public Comment: string;
}