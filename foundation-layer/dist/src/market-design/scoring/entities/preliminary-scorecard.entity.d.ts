export type PreliminaryScorecard = Readonly<{
    clarity_score: number;
    resolvability_score: number;
    novelty_score: number;
    liquidity_potential_score: number;
    ambiguity_risk_score: number;
    duplicate_risk_score: number;
    editorial_value_score: number;
    final_publish_score: number;
}>;
export declare const createPreliminaryScorecard: (input: PreliminaryScorecard) => PreliminaryScorecard;
//# sourceMappingURL=preliminary-scorecard.entity.d.ts.map