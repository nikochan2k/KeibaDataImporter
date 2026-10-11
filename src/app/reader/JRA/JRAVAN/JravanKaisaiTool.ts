import { JraKaisaiTool } from "../JraKaisaiTool";

export class JravanKaisaiTool extends JraKaisaiTool {
  protected readonly keyOffset = 0;
}

export const jravanKaisaiTool = new JravanKaisaiTool();
