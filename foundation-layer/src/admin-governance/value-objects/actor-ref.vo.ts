import type { Branded } from "../../common/types/branded.js";
import { createNonEmpty } from "./shared.vo.js";

export type ActorRef = Branded<string, "ActorRef">;

export const createActorRef = (value: string): ActorRef =>
  createNonEmpty(value, "actor_ref") as ActorRef;
