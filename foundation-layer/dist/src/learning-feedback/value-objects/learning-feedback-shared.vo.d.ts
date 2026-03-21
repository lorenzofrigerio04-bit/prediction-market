export type LearningRef = string;
export type LearningText = string;
export declare const createLearningRef: (value: string, fieldName: string) => LearningRef;
export declare const createLearningText: (value: string, fieldName: string) => LearningText;
export declare const createLearningRefList: (values: readonly string[], fieldName: string, minimum?: number) => readonly LearningRef[];
export declare const createLearningTextList: (values: readonly string[], fieldName: string, minimum?: number) => readonly LearningText[];
//# sourceMappingURL=learning-feedback-shared.vo.d.ts.map