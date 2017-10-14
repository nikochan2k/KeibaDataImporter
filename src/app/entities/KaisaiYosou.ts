import {
  Column,
  Entity,
  PrimaryColumn
} from "typeorm";

@Entity("KaisaiYosou")
export class KaisaiYosou {
  @PrimaryColumn("bigint")
  public Id: number;

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
