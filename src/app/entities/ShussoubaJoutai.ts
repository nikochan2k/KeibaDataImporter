import {
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm";

export enum Kubun {
  // KYG, KYH, KYI
  TaikeiSougaou,
  UmaTokki,
  // SKB
  Tokki,
  Bagu,
  BaguHami,
  BaguBandage,
  BaguTeitetsu,
  BaguHidume,
  BaguSoe,
  BaguKotsuryuu,
  AshimotoSougou,
  AshimotoHidariMae,
  AshimotoMigiMae,
  AshimotoHidariUshiro,
  AshimotoMigiUshiro,
}

@Entity("ShussoubaJoutai")
@Index("IxShussoubaJoutai", (stj: ShussoubaJoutai) => [stj.ShussoubaId])
export class ShussoubaJoutai {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint")
  public ShussoubaId: number;

  @Column("tinyint")
  public Kubun: Kubun;

  @Column("tinyint")
  public Bangou: number;

  @Column("smallint", { nullable: true })
  public Code: number;
}