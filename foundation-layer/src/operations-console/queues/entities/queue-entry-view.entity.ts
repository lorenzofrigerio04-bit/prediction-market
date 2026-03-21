import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ActionKey } from "../../enums/action-key.enum.js";
import { EntryType } from "../../enums/entry-type.enum.js";
import type { DisplayLabel } from "../../value-objects/display-label.vo.js";
import type { QueueEntryRef } from "../../value-objects/queue-entry-ref.vo.js";
import type { WarningMessage } from "../../value-objects/warning-message.vo.js";

export type QueueEntryView = Readonly<{
  entry_ref: QueueEntryRef;
  entry_type: EntryType;
  display_title: DisplayLabel;
  status: string;
  priority: number;
  created_at: string;
  owner_nullable: string | null;
  warnings: readonly WarningMessage[];
  available_actions: readonly ActionKey[];
}>;

export const createQueueEntryView = (input: QueueEntryView): QueueEntryView => deepFreeze({ ...input });
