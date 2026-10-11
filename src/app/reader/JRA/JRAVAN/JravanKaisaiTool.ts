import { Injectable } from "@nestjs/common";
import { JraKaisaiTool } from "../JraKaisaiTool";

@Injectable()
export class JravanKaisaiTool extends JraKaisaiTool {
  protected readonly keyOffset = 0;
}
