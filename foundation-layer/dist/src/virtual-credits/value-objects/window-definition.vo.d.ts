import type { Branded } from "../../common/types/branded.js";
import { MeasurementWindowUnit } from "../enums/measurement-window-unit.enum.js";
export type WindowDefinition = Readonly<{
    unit: MeasurementWindowUnit;
    size: number;
}>;
export type WindowDefinitionVo = Branded<WindowDefinition, "WindowDefinitionVo">;
export declare const createWindowDefinition: (value: WindowDefinition) => WindowDefinitionVo;
//# sourceMappingURL=window-definition.vo.d.ts.map