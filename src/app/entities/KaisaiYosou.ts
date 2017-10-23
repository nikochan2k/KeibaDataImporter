import {
  Column,
  Entity,
  PrimaryColumn
} from "typeorm";

@Entity("KaisaiYosou")
export class KaisaiYosou {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("tinyint", { nullable: true })
  public Tenki?: number;

  @Column("tinyint", { nullable: true })
  public ShibaBaba?: number;

  @Column("tinyint", { nullable: true })
  public ShibaBabaSokudo?: number; // 0:普通 1:速い 2:遅い

  @Column("tinyint", { nullable: true })
  public ShibaBabaUchi?: number;

  @Column("tinyint", { nullable: true })
  public ShibaBabaNaka?: number;

  @Column("tinyint", { nullable: true })
  public ShibaBabaSoto?: number;

  @Column("real", { nullable: true })
  public ShibaBabaSa?: number;

  @Column("real", { nullable: true })
  public ChokusenBabaSaSaiuchi?: number;

  @Column("real", { nullable: true })
  public ChokusenBabaSaUchi?: number;

  @Column("real", { nullable: true })
  public ChokusenBabaSaNaka?: number;

  @Column("real", { nullable: true })
  public ChokusenBabaSaSoto?: number;

  @Column("real", { nullable: true })
  public ChokusenBabaSaOsoto?: number;

  @Column("tinyint", { nullable: true })
  public DirtBaba?: number;

  @Column("tinyint", { nullable: true })
  public DirtBabaSokudo?: number; // 0:普通 1:速い 2:遅い

  @Column("tinyint", { nullable: true })
  public DirtBabaUchi?: number;

  @Column("tinyint", { nullable: true })
  public DirtBabaNaka?: number;

  @Column("tinyint", { nullable: true })
  public DirtBabaSoto?: number;

  @Column("real", { nullable: true })
  public DirtBabaSa?: number;

  @Column("tinyint", { nullable: true })
  public RenzokuNissuu?: number;

  @Column("tinyint", { nullable: true })
  public ShibaShurui?: number;

  @Column("real", { nullable: true })
  public Kusatake?: number;

  @Column("tinyint", { nullable: true })
  public Tenatsu?: number;

  @Column("tinyint", { nullable: true })
  public TouketsuBoushizai?: number;

  @Column("real", { nullable: true })
  public ChuukanKousuiryou?: number;
}
