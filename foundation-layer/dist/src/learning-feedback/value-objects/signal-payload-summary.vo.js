import { ValidationError } from "../../common/errors/validation-error.js";
export const createSignalPayloadSummary = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_SIGNAL_PAYLOAD_SUMMARY", "signal_payload_summary must not be empty", { value });
    }
    return normalized;
};
//# sourceMappingURL=signal-payload-summary.vo.js.map