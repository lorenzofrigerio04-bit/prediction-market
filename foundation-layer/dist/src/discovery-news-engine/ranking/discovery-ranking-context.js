/**
 * Helpers for building or using ranking context.
 * Context type is defined in interfaces/discovery-ranking-evaluator.ts.
 */
/**
 * Group trend snapshots by cluster id for use in DiscoveryRankingContext.
 */
export function groupSnapshotsByClusterId(snapshots) {
    const byCluster = new Map();
    for (const s of snapshots) {
        const id = String(s.clusterId);
        const list = byCluster.get(id) ?? [];
        list.push(s);
        byCluster.set(id, list);
    }
    return byCluster;
}
//# sourceMappingURL=discovery-ranking-context.js.map