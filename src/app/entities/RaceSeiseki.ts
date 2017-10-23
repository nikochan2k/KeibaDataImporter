import {
  Column,
  Entity,
  PrimaryColumn
} from "typeorm";

@Entity("RaceSeiseki")
export class RaceSeiseki {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("tinyint", { nullable: true })
  public TorikeshiTousuu?: number;

  @Column("tinyint", { nullable: true })
  public Pace?: number;

  @Column("real", { nullable: true })
  public PaceShisuu?: number;

  @Column("tinyint", { nullable: true })
  public PaceUpNokoriFalon?: number;

  @Column("tinyint", { nullable: true })
  public PaceNagare?: number;

  @Column("tinyint", { nullable: true })
  public Tenki?: number;

  @Column("tinyint", { nullable: true })
  public Baba?: number;

  @Column("tinyint", { nullable: true })
  public BabaSokudo?: number; // 0:普通 1:速い 2:遅い

  @Column("real", { nullable: true })
  public ShougaiHeikin1F?: number;

  @Column("int", { nullable: true })
  public Shoukin1Chaku: number;

  @Column("int", { nullable: true })
  public Shoukin2Chaku: number;

  @Column("int", { nullable: true })
  public Shoukin3Chaku: number;

  @Column("int", { nullable: true })
  public Shoukin4Chaku: number;

  @Column("int", { nullable: true })
  public Shoukin5Chaku: number;

  @Column("int", { nullable: true })
  public Shoukin5ChakuDouchaku: number;

  @Column("int", { nullable: true })
  public Shoukin5ChakuDouchaku2: number;

  @Column("text", { nullable: true })
  public SeisaiNaiyou?: string;

  @Column("text", { nullable: true })
  public RaceComment?: string;

  @Column("int", { nullable: true })
  public KolNengappi: number;

  @Column("tinyint", { nullable: true })
  public Jrdb: number;
}
