import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import * as $C from "../../converters/Common";
import { HaitouInfo } from "../../converters/RaceHaitou";
import { ShoukinInfo } from "../../converters/RaceShoukin";
import { Race } from "../../entities/Race";
import { RaceHaitou } from "../../entities/RaceHaitou";
import { RaceKeika } from "../../entities/RaceKeika";
import { RaceLapTime } from "../../entities/RaceLapTime";
import { RaceShoukin } from "../../entities/RaceShoukin";
import { Record } from "../../entities/Record";
import { DataTool } from "../DataTool";
import {
  readDate,
  readDouble,
  readPositiveInt,
  readStrWithNoSpace,
  readTime
  } from "../Reader";

@Service()
export class KolRaceTool {

  @OrmEntityManager()
  private entityManager: EntityManager;

  @Inject()
  private tool: DataTool;

  public async deleteOldShutsubahyou(race: Race) {
    await this.entityManager
      .createQueryBuilder(RaceShoukin, "rs")
      .delete()
      .where("rs.RaceId = :raceId")
      .andWhere("rs.Kakutei = 0")
      .setParameter("raceId", race.Id)
      .execute();
  }

  public async deleteOldSeiseki(race: Race) {
    await this.entityManager
      .createQueryBuilder(RaceShoukin, "rs")
      .delete()
      .where("rs.RaceId = :raceId")
      .andWhere("rs.Kakutei = 1")
      .setParameter("raceId", race.Id)
      .execute();

    await this.entityManager
      .createQueryBuilder(RaceLapTime, "rlt")
      .delete()
      .where("rlt.RaceId = :raceId")
      .setParameter("raceId", race.Id)
      .execute();

    await this.entityManager
      .createQueryBuilder(RaceKeika, "rk")
      .delete()
      .where("rk.RaceId = :raceId")
      .setParameter("raceId", race.Id)
      .execute();

    await this.entityManager
      .createQueryBuilder(RaceHaitou, "rh")
      .delete()
      .where("rh.RaceId = :raceId")
      .setParameter("raceId", race.Id)
      .execute();
  }

  public async getRecord(buffer: Buffer, offset: number, bashoOffset: number) {
    const nengappi = readDate(buffer, offset, 8);
    const bamei = readStrWithNoSpace(buffer, offset + 12, 30);
    if (!nengappi || !bamei) {
      return null;
    }

    const kyousouba = readStrWithNoSpace(buffer, offset + 12, 30);

    let record = await this.entityManager
      .getRepository(Record)
      .createQueryBuilder("r")
      .where("r.Nengappi = :nengappi")
      .andWhere("r.Kyousouba = :kyousouba")
      .setParameter("nengappi", this.tool.toDateString(nengappi))
      .setParameter("kyousouba", kyousouba)
      .getOne();
    if (record) {
      return record;
    }

    record = new Record();
    record.Nengappi = nengappi;
    record.Time = readTime(buffer, offset + 8, 4);
    record.Kyousouba = kyousouba;
    record.Kinryou = readDouble(buffer, offset + 42, 3, 0.1);
    record.TanshukuKishuMei = readStrWithNoSpace(buffer, offset + 45, 8);
    record.Basho = $C.basho.toCodeFromKol(buffer, bashoOffset, 2);
    return this.entityManager.persist(record);
  }

  public async saveRaceShoukin(buffer: Buffer, race: Race, infos: ShoukinInfo[],
    kakutei: number, mul?: number) {
    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      const shoukin = readPositiveInt(buffer, info.offset, info.length, mul);
      if (!shoukin) {
        continue;
      }
      const raceShoukin = new RaceShoukin();
      raceShoukin.Id = race.Id * 100 + kakutei * 10 + i;
      raceShoukin.Race = race;
      raceShoukin.Kakutei = kakutei;
      raceShoukin.Chakujun = info.chakujun;
      raceShoukin.Shoukin = shoukin;
      raceShoukin.Fukashou = info.fukashou;
      await this.entityManager.persist(raceShoukin);
    }
  }

  public async saveRaceHaitou(buffer: Buffer, race: Race, infos: HaitouInfo[]) {
    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      const bangou1 = readPositiveInt(buffer, info.bangou1, info.bangou1Len);
      if (!bangou1) {
        continue;
      }
      const raceHaitou = new RaceHaitou();
      raceHaitou.Id = race.Id * 100 + i;
      raceHaitou.Race = race;
      raceHaitou.Baken = info.baken;
      raceHaitou.Bangou1 = bangou1;
      if (info.bangou2) {
        raceHaitou.Bangou2 = readPositiveInt(buffer, info.bangou2, info.bangou2Len);
      }
      if (info.bangou3) {
        raceHaitou.Bangou3 = readPositiveInt(buffer, info.bangou3, info.bangou3Len);
      }
      raceHaitou.Haitoukin = readPositiveInt(buffer, info.haitou, info.haitouLen);
      if (info.ninki) {
        raceHaitou.Ninki = readPositiveInt(buffer, info.ninki, info.ninkiLen);
      }
      await this.entityManager.persist(raceHaitou);
    }
  }
}