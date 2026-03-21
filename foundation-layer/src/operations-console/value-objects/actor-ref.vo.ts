import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type ActorRef = Branded<string, "ActorRef">;

export const createActorRef = (value: string): ActorRef =>
  createPrefixedId(value, "act_", "ActorRef") as ActorRef;
