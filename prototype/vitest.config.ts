import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['prototype/*.test.ts'], maxWorkers: 1 } });
