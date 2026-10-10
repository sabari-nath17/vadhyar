import console from 'node:console';
import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

const offline = process.argv.includes('--offline');
if (!offline && (!process.env.OPENAI_API_KEY || !process.env.VADHYAR_EVAL_MODEL)) {
  console.error('Set OPENAI_API_KEY and VADHYAR_EVAL_MODEL in your environment. No request was made. Use npm run eval:coach -- --offline for validator fixtures only.');
  process.exitCode = 1;
} else {
  await build({ entryPoints: ['scripts/coach-eval.ts'], outfile: 'dist/coach-eval.mjs', bundle: true, platform: 'node', format: 'esm', packages: 'external', target: 'node22' });
  await mkdir('dist/evals', { recursive: true });
  const child = spawn(process.execPath, ['node_modules/promptfoo/dist/src/main.js', 'eval', '--config', 'evals/coach.yaml', '--no-cache', '--no-write', '--max-concurrency', '1', '--output', `dist/evals/${offline ? 'validators' : 'coach'}.json`, ...(offline ? ['--filter-pattern', 'validator'] : [])], {
    stdio: 'inherit', env: { ...process.env, PROMPTFOO_DISABLE_TELEMETRY: '1', PROMPTFOO_DISABLE_UPDATE: '1', PROMPTFOO_CONFIG_DIR: `${process.cwd()}/dist/evals/config`, PROMPTFOO_CACHE_ENABLED: 'false' },
  });
  child.on('error', () => { console.error('Could not start Promptfoo.'); process.exitCode = 1; });
  child.on('exit', code => { process.exitCode = code ?? 1; });
}
