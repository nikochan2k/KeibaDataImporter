import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("Choukyou")
@Index("IxChoukyou", (c: Choukyou) => [c.ShussoubaId])
export class Choukyou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public ShussoubaId: number;

  @Column("smallint")
  public Bangou: number;

  @Column("smallint", { nullable: true })
  public ChoukyouFlag?: number;

  @Column("smallint", { nullable: true })
  public Noriyaku?: number;

  @Column("bigint", { nullable: true })
  public TanshukuKishuMeiId: number;

  @Column("bigint", { nullable: true })
  public Nengappi?: number;

  @Column("smallint", { nullable: true })
  public Basho?: number;

  @Column("smallint", { nullable: true })
  public Type?: number;

  @Column("smallint", { nullable: true })
  public Course?: number;

  @Column("varchar", { length: 12, nullable: true })
  public BashoCourse?: string;

  @Column("smallint", { nullable: true })
  public Baba?: number;

  @Column("smallint", { nullable: true })
  public Kaisuu?: number;

  @Column("smallint", { nullable: true })
  public IchiDori?: number;

  @Column("smallint", { nullable: true })
  public Oikiri?: number;

  @Column("smallint", { nullable: true })
  public Ashiiro?: number;

  @Column("varchar", { length: 9, nullable: true })
  public OikiriSonota?: string;

  @Column("smallint", { nullable: true })
  public Yajirushi?: number; // 1:一変　2:平行 3:下降　4:良化　5:下降気味

  @Column("varchar", { length: 60, nullable: true })
  public Reigai?: string;

  @Column("int", { nullable: true })
  public AwaseUmaId?: number;

  @Column("smallint", { nullable: true })
  public AwaseKekka?: number;

  @Column("smallint", { nullable: true })
  public Chakusa?: number;

  @Column("float", { nullable: true })
  public TimeSa?: number;

  @Column("varchar", { length: 129, nullable: true })
  public AwaseReigai?: string;
}
