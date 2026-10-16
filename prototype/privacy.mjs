// shortcut: common credential literals only; review source and output before sharing them.
export const privateText = /(\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY|(?:api[_-]?key|secret|password|token)(?:\\?["'])?\s*[:=]\s*\\?["'][^"'])/i;

export function createTeachingContext(source, requirement, caseInput) {
 return {
  path: source.path,
  language: source.language,
  startLine: source.startLine,
  endLine: source.endLine,
  source: source.text.split('\n').map((line, index) => `${source.startLine + index}: ${line}`).join('\n'),
  requirement,
  caseInput,
 };
}
