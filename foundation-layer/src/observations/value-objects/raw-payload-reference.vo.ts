import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type RawPayloadReference = Readonly<{
  uri: string;
  checksum: string | null;
}>;

export const createRawPayloadReference = (input: RawPayloadReference): RawPayloadReference => {
  const uri = input.uri.trim();
  if (uri.length === 0) {
    throw new ValidationError("INVALID_RAW_PAYLOAD_REFERENCE", "uri must be non-empty");
  }

  const checksum = input.checksum === null ? null : input.checksum.trim();
  if (checksum !== null && checksum.length === 0) {
    throw new ValidationError("INVALID_RAW_PAYLOAD_REFERENCE", "checksum cannot be empty");
  }

  return deepFreeze({
    uri,
    checksum,
  });
};
