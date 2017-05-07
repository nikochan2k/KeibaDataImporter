import { EntityManager } from "typeorm";
import { RaceReader, HaitouInfo, ShoukinInfo } from "./RaceReader";
import { Race } from "../entities/Race";
import { Record } from "../entities/Record";
import { RaceShoukin } from "../entities/RaceShoukin";
import { RaceHaitou } from "../entities/RaceHaitou";
import * as $C from "../converters/Race";

export abstract class KolRaceReader extends RaceReader {

  constructor(entityManager: EntityManager, fd: number) {
    super(entityManager, fd);
  }

  protected async getRecord(buffer: Buffer, offset: number,
    bashoOffset: number) {
    const nengappi = super.readDate(buffer, offset, 8);
    const bamei = super.readStr(buffer, offset + 12, 30);
    const time = super.readTime(buffer, offset + 8, 4);
    if (!nengappi || !bamei || !time) {
      return null;
    }

    let record = await this.entityManager
      .getRepository(Record)
      .createQueryBuilder("r")
      .where("r.Nengappi = :nengappi")
      .andWhere("r.Bamei = :bamei")
      .setParameter("nengappi", super.toDateString(nengappi))
      .setParameter("bamei", bamei)
      .getOne();
    if (record) {
      return record;
    }

    record = new Record();
    record.Nengappi = nengappi;
    record.Time = time;
    record.Bamei = bamei;
    record.Kinryou = super.readDouble(buffer, offset + 42, 3, 0.1);
    record.TanshukuKishuMei = super.readStr(buffer, offset + 45, 8);
    record.Basho = $C.basho.toCodeFromKol(
      super.readRaw(buffer, bashoOffset, 2));
    record = await this.persist(record);

    return record;
  }

  public saveRaceShoukin(buffer: Buffer, race: Race, infos: ShoukinInfo[],
    kakutei: number, mul?: number) {
    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      const shoukin = super.readPositiveInt(buffer, info.offset,
        info.length, mul);
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
      this.persist(raceShoukin);
    }
  }

  public async saveRaceHaitou(buffer: Buffer, race: Race, infos: HaitouInfo[]) {
    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      const bangou1 = super.readPositiveInt(buffer, info.bangou1, info.bangou1Len);
      if (!bangou1) {
        continue;
      }
      const raceHaitou = new RaceHaitou();
      raceHaitou.Id = race.Id * 100 + i;
      raceHaitou.Race = race;
      raceHaitou.Baken = info.baken;
      raceHaitou.Bangou1 = bangou1;
      if (info.bangou2) {
        raceHaitou.Bangou2 = super.readPositiveInt(buffer, info.bangou2, info.bangou2Len);
      }
      if (info.bangou3) {
        raceHaitou.Bangou3 = super.readPositiveInt(buffer, info.bangou3, info.bangou3Len);
      }
      raceHaitou.Haitoukin = super.readPositiveInt(buffer, info.haitou,
        info.haitouLen);
      if (info.ninki) {
        raceHaitou.Ninki = super.readPositiveInt(buffer, info.ninki,
          info.ninkiLen);
      }
      this.persist(raceHaitou);
    }
  }
}