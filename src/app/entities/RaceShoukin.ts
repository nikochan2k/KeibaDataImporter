import { Entity, Index, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Race } from "./Race";

@Entity("RaceShoukin")
@Index("IxRaceShoukin", (rs: RaceShoukin) => [rs.Race])
export class RaceShoukin {
  @PrimaryColumn("bigint")
  public Id: number;

  @Column("bigint", { name: "RaceId" })
  @ManyToOne(() => Race, r => r.RaceShoukinList)
  @JoinColumn({ name: "RaceId" })
  public Race: Race;

  @Column("smallint")
  public Chakujun: number; // 0:附加賞

  @Column("int")
  public Shoukin: number;
}