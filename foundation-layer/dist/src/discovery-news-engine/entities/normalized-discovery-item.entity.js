import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createNormalizedDiscoveryItem = (input) => deepFreeze({
    ...input,
    bodySnippetNullable: input.bodySnippetNullable ?? null,
    geoSignalNullable: input.geoSignalNullable ?? null,
    geoPlaceTextNullable: input.geoPlaceTextNullable ?? null,
    topicSignalNullable: input.topicSignalNullable ?? null,
    observedMetricsNullable: input.observedMetricsNullable ?? null,
});
//# sourceMappingURL=normalized-discovery-item.entity.js.map