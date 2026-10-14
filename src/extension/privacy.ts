// shortcut: detects common credential literals, not every secret; reviewed context is still required.
export const privateText = /(\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY|(?:api[_-]?key|secret|password|token)(?:\\?["'])?\s*[:=]\s*\\?["'][^"']+\\?["'])/i;
