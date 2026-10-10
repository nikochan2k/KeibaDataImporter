import { Service } from "typedi";
import { Se$ } from "./Se$";

@Service()
export class Sec extends Se$ {
  // 速報版は一部の項目が空白なので、他のデータで入った値を消さない
  protected keepExisting = true;

  protected getBufferLength() {
    return 346;
  }
}
