import { Inject } from "typedi";
import * as $K from "../../../converters/Kaisai";
import * as $R from "../../../converters/Race";
import { Kaisai } from "../../../entities/Kaisai";
import { Bridge } from "../../Bridge";
import { DataToImport } from "../../DataToImport";
import { readDouble } from "../../Reader";
import { Tool } from "../../Tool";
import { JrdbRaceTool } from "../JrdbRaceTool";

export abstract class Ka$ extends DataToImport {

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

  public async save(buffer: Buffer, bridge: Bridge) {
    let toBe = this.jrdbRaceTool.createKaisai(buffer);
    if (!toBe) {
      return;
    }
    this.setKaisai(buffer, toBe);

    const asIs = await this.jrdbRaceTool.getKaisai(buffer);
    if (asIs) {
      const updateSet = this.tool.createUpdateSet(asIs, toBe, true);
      if (updateSet) {
        await this.entityManager
          .createQueryBuilder()
          .update(Kaisai, updateSet)
          .where("Id = :id")
          .setParameter("id", asIs.Id)
          .execute();
      }
      toBe = asIs;
    } else {
      toBe = await this.entityManager.save(toBe);
    }
  }

  protected setKaisai(buffer: Buffer, toBe: Kaisai) {
    toBe.KaisaiKubun = $K.youbi.toCodeFromJrdb(buffer, 14, 1);
    toBe.Youbi = $K.youbi.toCodeFromJrdb(buffer, 15, 2);
    toBe.Tenki = $R.tenki.toCodeFromJravan(buffer, 21, 1);
    toBe.ShibaBaba = $R.baba.toCodeFromJrdb(buffer, 22, 1);
    toBe.ShibaBabaSokudo = $R.babaSokudo.toCodeFromJrdb(buffer, 23, 1);
    toBe.ShibaBabaUchi = $K.babaJoutai.toCodeFromJrdb(buffer, 24, 1);
    toBe.ShibaBabaNaka = $K.babaJoutai.toCodeFromJrdb(buffer, 25, 1);
    toBe.ShibaBabaSoto = $K.babaJoutai.toCodeFromJrdb(buffer, 26, 1);
    toBe.ShibaBabaSa = readDouble(buffer, 27, 3, 0.1);
    toBe.ChokusenBabaSaSaiuchi = readDouble(buffer, 30, 2, 0.1);
    toBe.ChokusenBabaSaUchi = readDouble(buffer, 32, 2, 0.1);
    toBe.ChokusenBabaSaNaka = readDouble(buffer, 34, 2, 0.1);
    toBe.ChokusenBabaSaSoto = readDouble(buffer, 36, 2, 0.1);
    toBe.ChokusenBabaSaOsoto = readDouble(buffer, 38, 2, 0.1);
    toBe.DirtBaba = $R.baba.toCodeFromJrdb(buffer, 40, 1);
    toBe.DirtBabaSokudo = $R.babaSokudo.toCodeFromJrdb(buffer, 41, 1);
    toBe.DirtBabaUchi = $K.babaJoutai.toCodeFromJrdb(buffer, 42, 1);
    toBe.DirtBabaNaka = $K.babaJoutai.toCodeFromJrdb(buffer, 43, 1);
    toBe.DirtBabaSoto = $K.babaJoutai.toCodeFromJrdb(buffer, 44, 1);
    toBe.DirtBabaSa = readDouble(buffer, 45, 3, 0.1);
  }
}