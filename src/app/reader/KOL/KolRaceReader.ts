import { EntityManager } from "typeorm";
import { readDate, readStrWithNoSpace, readPositiveInt, readTime, readDouble, toDateString } from "../ReadTool";
import { KolReader } from "./KolReader";
import { Race } from "../../entities/Race";
import { Record } from "../../entities/Record";
import { RaceShoukin } from "../../entities/RaceShoukin";
import { RaceHaitou } from "../../entities/RaceHaitou";
import * as $C from "../../converters/Common";
import { ShoukinInfo } from "../../converters/RaceShoukin";
import { HaitouInfo } from "../../converters/RaceHaitou";

export abstract class KolRaceReader extends KolReader {

  constructor(entityManager: EntityManager, fd: number) {
    super(entityManager, fd);
  }

  protected async getRecord(buffer: Buffer, offset: number, bashoOffset: number) {
    const nengappi = readDate(buffer, offset, 8);
    const bamei = readStrWithNoSpace(buffer, offset + 12, 30);
    const time = readTime(buffer, offset + 8, 4);
    if (!nengappi || !bamei || !time) {
      return null;
    }

    let record = await this.entityManager
      .getRepository(Record)
      .createQueryBuilder("r")
      .where("r.Nengappi = :nengappi")
      .andWhere("r.Bamei = :bamei")
      .setParameter("nengappi", toDateString(nengappi))
      .setParameter("bamei", bamei)
      .getOne();
    if (record) {
      return record;
    }

    record = new Record();
    record.Nengappi = nengappi;
    record.Time = time;
    record.Bamei = bamei;
    record.Kinryou = readDouble(buffer, offset + 42, 3, 0.1);
    record.TanshukuKishuMei = readStrWithNoSpace(buffer, offset + 45, 8);
    record.Basho = $C.basho.toCodeFromKol(buffer, bashoOffset, 2);
    record = await this.entityManager.persist(record);

    return record;
  }

  public saveRaceShoukin(buffer: Buffer, race: Race, infos: ShoukinInfo[],
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
      this.entityManager.persist(raceShoukin);
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
      this.entityManager.persist(raceHaitou);
    }
  }
}