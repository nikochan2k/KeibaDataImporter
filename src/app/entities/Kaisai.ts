import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

@Entity("Kaisai")
@Index("IxKaisai1", (r: Kaisai) => [r.Basho, r.Kaiji, r.Nichiji])
@Index("IxKaisai2", (r: Kaisai) => [r.Basho, r.Nengappi])
export class Kaisai {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("smallint")
  public Basho: number;

  @Column("smallint")
  public Nen: number;

  @Column("smallint", { nullable: true })
  public Kaiji?: number;

  @Column("smallint", { nullable: true })
  public Nichiji?: number;

  @Column("bigint", { nullable: true })
  public Nengappi?: number;

  @Column("smallint", { nullable: true })
  public Youbi: number;

  @Column("smallint", { nullable: true })
  public Kyuujitsu?: number;

  @Column("smallint", { nullable: true })
  public KaisaiKubun?: number;

  @Column("smallint", { nullable: true })
  public ChuuouChihouGaikoku?: number;

  @Column("varchar", { nullable: true, length: 30 })
  public GaikokuKeibajouMei: string;

  @Column("smallint", { nullable: true })
  public Tenki?: number;

  @Column("smallint", { nullable: true })
  public ShibaBaba?: number;

  @Column("smallint", { nullable: true })
  public ShibaBabaSokudo?: number; // 0:普通 1:速い 2:遅い

  @Column("smallint", { nullable: true })
  public ShibaBabaUchi?: number;

  @Column("smallint", { nullable: true })
  public ShibaBabaNaka?: number;

  @Column("smallint", { nullable: true })
  public ShibaBabaSoto?: number;

  @Column("float", { nullable: true })
  public ShibaBabaSa?: number;

  @Column("float", { nullable: true })
  public ChokusenBabaSaSaiuchi?: number;

  @Column("float", { nullable: true })
  public ChokusenBabaSaUchi?: number;

  @Column("float", { nullable: true })
  public ChokusenBabaSaNaka?: number;

  @Column("float", { nullable: true })
  public ChokusenBabaSaSoto?: number;

  @Column("float", { nullable: true })
  public ChokusenBabaSaOsoto?: number;

  @Column("smallint", { nullable: true })
  public DirtBaba?: number;

  @Column("smallint", { nullable: true })
  public DirtBabaSokudo?: number; // 0:普通 1:速い 2:遅い

  @Column("smallint", { nullable: true })
  public DirtBabaUchi?: number;

  @Column("smallint", { nullable: true })
  public DirtBabaNaka?: number;

  @Column("smallint", { nullable: true })
  public DirtBabaSoto?: number;

  @Column("float", { nullable: true })
  public DirtBabaSa?: number;

  @Column("smallint", { nullable: true })
  public RenzokuNissuu?: number;

  @Column("smallint", { nullable: true })
  public ShibaShurui?: number;

  @Column("real", { nullable: true })
  public Kusatake?: number;

  @Column("smallint", { nullable: true })
  public Tenatsu?: number;

  @Column("smallint", { nullable: true })
  public TouketsuBoushizai?: number;

  @Column("real", { nullable: true })
  public ChuukanKousuiryou?: number;
}
