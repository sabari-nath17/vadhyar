import { fileURLToPath } from 'node:url';

export default {
  root: fileURLToPath(new URL('.', import.meta.url)),
  resolve: { alias: { '@novadesk/approval': fileURLToPath(new URL('../../novadesk/src/approval.ts', import.meta.url)) } },
  test: { include: ['transfer.test.ts'] },
};
