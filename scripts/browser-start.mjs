#!/usr/bin/env node
import process from 'node:process';
import { resolve } from 'node:path';

try {
 if (Number(process.versions.node.split('.')[0]) < 24) throw new Error('Install Node.js 24 LTS or newer before starting Vadhyar.');
 const args = process.argv.slice(2);
 if (![2, 4].includes(args.length) || args[0] !== '--project' || !args[1] || (args.length === 4 && args[2] !== '--port')) throw new Error('Use node start.mjs --project /path/to/trusted/project [--port 4188].');
 const port = args[3] ?? '4173';
 if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535) throw new Error('Choose a local port between 1024 and 65535.');
 process.env.VADHYAR_MOCK_PORT = port;
 process.argv = [process.execPath, process.argv[1], '--project', resolve(args[1])];
 const { launchProject } = await import('./runtime/serve.mjs');
 try { await launchProject(); }
 catch (error) { throw new Error('Vadhyar could not start. Check the trusted project folder and local port.', { cause: error }); }
} catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
