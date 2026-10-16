export const privateText: RegExp;

export function createTeachingContext(
 source: { path: string; language: string; startLine: number; endLine: number; text: string },
 requirement: string,
 caseInput: string,
): {
 path: string;
 language: string;
 startLine: number;
 endLine: number;
 source: string;
 requirement: string;
 caseInput: string;
};
