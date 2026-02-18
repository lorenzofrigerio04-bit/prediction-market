/**
 * Template Context
 * BLOCCO 4: Template Engine
 */

export type TemplateContext = {
  storylineId: string;
  authorityType: "OFFICIAL" | "REPUTABLE";
  authorityHost: string;
  // extracted basics (deterministic):
  entityA?: string;
  entityB?: string;
  topic?: string;
  closesAt: Date;
};
