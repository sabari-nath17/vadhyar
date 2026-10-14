#!/usr/bin/env node
import process from 'node:process';
import './build.mjs';
import { launchProject } from './serve.mjs';
try { await launchProject(); }
catch { process.stderr.write('Project companion could not start. Choose an existing trusted folder with --project.\n'); process.exitCode = 1; }
