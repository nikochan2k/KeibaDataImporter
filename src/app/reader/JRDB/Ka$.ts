import * as $K from "../../converters/Kaisai";
import * as $R from "../../converters/Race";
import { Kaisai } from "../../entities/Kaisai";
import { KaisaiYosou } from "../../entities/KaisaiYosou";
import { readDouble } from "../Reader";
import { JrdbKaisaiData } from './JrdbKaisaiData';

export abstract class Ka$ extends JrdbKaisaiData {

  protected getKaisaiTool() {
    return this.jrdbKaisaiKaisaiTool;
  }

  protected setKaisai(buffer: Buffer, toBe: Kaisai) {
    toBe.KaisaiKubun = $K.kaisaiKubun.toCodeFromJrdb(buffer, 14, 1);
    this.jrdbKaisaiTool.setYoubi(toBe, buffer, 15, 2);
  }

  protected async saveKaisaiRelated(buffer: Buffer, kaisai: Kaisai) {
    await this.saveKaisaiYosou(buffer, kaisai);
  }

  protected async saveKaisaiYosou(buffer: Buffer, kaisai: Kaisai) {
    const toBe = new KaisaiYosou();
    toBe.Id = kaisai.Id;
    this.setKaisaiYosou(buffer, toBe);

    const asIs = await this.entityManager.findOne(KaisaiYosou, toBe.Id);
    await this.tool.saveOrUpdate(KaisaiYosou, asIs, toBe);
  }

  protected setKaisaiYosou(buffer: Buffer, toBe: KaisaiYosou) {
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