import { Service } from "typedi";
import { JraKaisaiTool } from "../JraKaisaiTool";

/** JV-Data のレコードは、レコード種別 ID(2)、データ区分(1)、データ作成年月日(8) の後に「年月日場回日R」がある */
@Service()
export class JvdataKaisaiTool extends JraKaisaiTool {
  protected readonly keyOffset = 11;
}
