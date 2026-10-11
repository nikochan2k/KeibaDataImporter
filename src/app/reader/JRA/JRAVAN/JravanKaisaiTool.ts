import { Service } from "typedi";
import { JraKaisaiTool } from "../JraKaisaiTool";

@Service()
export class JravanKaisaiTool extends JraKaisaiTool {
  protected readonly keyOffset = 0;
}
