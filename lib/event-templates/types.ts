export type Category =
  | "Politica"
  | "Cultura"
  | "Sport"
  | "Tecnologia"
  | "Economia"
  | "Scienza"
  | "Intrattenimento";

export interface EventTemplateContext {
  storylineId: string;
  authorityType: "OFFICIAL" | "REPUTABLE";
  authorityHost: string;
  entityA?: string;
  topic?: string;
  closesAt: Date;
}

export interface EventTemplate {
  id: string;
  category: Category;
  horizonDaysMin: number;
  horizonDaysMax: number;
  question: (ctx: EventTemplateContext) => string;
  resolutionCriteria: (ctx: EventTemplateContext) => { yes: string; no: string };
}
