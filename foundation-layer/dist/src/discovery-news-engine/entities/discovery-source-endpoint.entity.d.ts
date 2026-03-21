export type DiscoverySourceEndpoint = Readonly<{
    url: string;
    method: string;
    headersNullable: Readonly<Record<string, string>> | null;
}>;
export declare const createDiscoverySourceEndpoint: (input: DiscoverySourceEndpoint) => DiscoverySourceEndpoint;
//# sourceMappingURL=discovery-source-endpoint.entity.d.ts.map