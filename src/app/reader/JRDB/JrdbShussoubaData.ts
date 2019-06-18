import { JrdbRaceData } from './JrdbRaceData';
import { ShussoubaInfo } from '../ShussoubaTool';
import { JrdbShussoubaTool } from './JrdbShussoubaTool';
import { Inject } from 'typedi';
import { Shussouba } from '../../entities/Shussouba';


export abstract class JrdbShussoubaData extends JrdbRaceData {

  @Inject()
  protected jrdbShussoubaTool: JrdbShussoubaTool;

  public async save(buffer: Buffer) {
    await super.save(buffer);
    const info = await this.jrdbShussoubaTool.getShussoubaInfo(buffer, 8);
    if (!info) {
      return;
    }

    info.shussouba = await this.saveShussouba(buffer, info);
    await this.saveShussoubaRelated(buffer, info.shussouba);
  }

  protected async saveShussouba(buffer: Buffer, info: ShussoubaInfo) {
    const toBe = this.jrdbShussoubaTool.createShussouba(buffer, 8);
    if (!toBe) {
      return info.shussouba;
    }
    this.setShussouba(buffer, toBe, info);
    toBe.Jrdb = 1;

    const asIs = info.shussouba;
    const shussouba = await this.tool.saveOrUpdate(Shussouba, asIs, toBe);
    return shussouba;
  }

  protected async setShussouba(buffer: Buffer, toBe: Shussouba, info: ShussoubaInfo) {
  }

  protected async saveShussoubaRelated(buffer: Buffer, shussouba: Shussouba) {
  }

}