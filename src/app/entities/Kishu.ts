import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("Kishu")
@Index("IxKishu1", (k: Kishu) => [k.KolKishuCode], { unique: true })
@Index("IxKishu2", (k: Kishu) => [k.JrdbKishuCode], { unique: true })
@Index("IxKishu3", (k: Kishu) => [k.JvDataKishuCode], { unique: true })
export class Kishu {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("mediumint", { nullable: true })
  public KolKishuCode?: number;

  @Column("mediumint", { nullable: true })
  public JrdbKishuCode?: number;

  @Column("varchar", { length: 5, nullable: true })
  public JvDataKishuCode?: string;

  @Column("int", { nullable: true })
  public Seinengappi?: number;

  @Column("tinyint", { nullable: true })
  public Seibetsu?: number;

  @Column("int", { nullable: true })
  public MenkyoKoufuNengappi?: number;

  @Column("int", { nullable: true })
  public MenkyoMasshouNengappi?: number;

  /** 所属(1:関東, 2:関西, 3:他) */
  @Column("tinyint", { nullable: true })
  public Shozoku?: number;

  /** 所属調教師 (JRA-VAN) */
  @Column("mediumint", { nullable: true })
  public ShozokuChoukyoushiId?: number;

  /** 招待区分 (1:地方 2:外国) */
  @Column("tinyint", { nullable: true })
  public ShoutaiKubun?: number;

  /** 招待騎手の地域名 (外国は招待国名、地方は所属地名) */
  @Column("varchar", { length: 30, nullable: true })
  public ShozokuBashoMei?: string;

  /** 現在の見習い区分 */
  @Column("tinyint", { nullable: true })
  public MinaraiKubun?: number;
}
