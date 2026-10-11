import { lstat, readFile, realpath, stat } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { z } from 'zod';
import { hash, type PreparedFile } from './source.js';

export const importSelectionSchema = z.object({ path: z.string().min(1).max(1000), title: z.string().min(1).max(200) }).strict();
export type ImportSelection = z.infer<typeof importSelectionSchema>;
export interface SpecRequirement { title: string; text: string; scenarios: { title: string; text: string }[] }

export function parseSpecification(text: string): SpecRequirement[] {
  if (text.length > 20_000) throw new Error('Specification exceeds 20,000 characters.');
  const requirements: SpecRequirement[] = [];
  let current: SpecRequirement | undefined;
  let scenario: SpecRequirement['scenarios'][number] | undefined;
  let fence: string | undefined;
  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    const marker = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker && (!fence || (marker[0] === fence[0] && marker.length >= fence.length))) { fence = fence ? undefined : marker; }
    const heading = !fence && !marker ? /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line) : null;
    if (heading && heading[1].length <= 3) {
      current = undefined; scenario = undefined;
      if (heading[1] === '###' && heading[2].startsWith('Requirement:')) {
        const title = heading[2].slice('Requirement:'.length).trim();
        if (!title || title.length > 200 || requirements.some(item => item.title === title)) throw new Error('Requirement titles must be nonempty, unique and at most 200 characters.');
        current = { title, text: line, scenarios: [] }; requirements.push(current);
      }
      continue;
    }
    if (!current) continue;
    current.text += `\n${line}`;
    if (heading?.[1] === '####') {
      scenario = undefined;
      if (heading[2].startsWith('Scenario:')) {
        const title = heading[2].slice('Scenario:'.length).trim();
        if (!title || current.scenarios.some(item => item.title === title)) throw new Error('Scenario titles must be nonempty and unique within a requirement.');
        scenario = { title, text: '' }; current.scenarios.push(scenario);
      }
    } else if (scenario) scenario.text += `${line}\n`;
  }
  if (!requirements.length || requirements.length > 20 || requirements.some(item => item.scenarios.length > 40)) throw new Error('Select a specification with 1–20 requirements and at most 40 scenarios per requirement.');
  return requirements.map(item => ({ ...item, text: item.text.trim(), scenarios: item.scenarios.map(s => ({ ...s, text: s.text.trim() })) }));
}

export async function readPickedSpecification(root: string, selected: string): Promise<PreparedFile> {
  if (!isAbsolute(selected) || (await lstat(selected)).isSymbolicLink()) throw new Error('Choose a regular Markdown file inside this workspace.');
  // Native pickers may return the physical path behind a workspace directory alias.
  const [base, file] = await Promise.all([realpath(root), realpath(selected)]);
  return readSpecification(base, relative(base, file));
}

export async function readSpecification(root: string, path: string): Promise<PreparedFile> {
  if (isAbsolute(path) || path.split(/[\\/]/).some(part => part === '..' || part.startsWith('.')) || !/\.md$/i.test(path)) throw new Error('Choose a Markdown specification inside this workspace.');
  const base = await realpath(root);
  const absolutePath = await realpath(resolve(base, path));
  const inside = relative(base, absolutePath);
  if (isAbsolute(inside) || inside.split(/[\\/]/).some(part => part === '..' || part.startsWith('.'))) throw new Error('Specification crosses the workspace boundary.');
  const info = await stat(absolutePath);
  if (!info.isFile() || info.size > 20_000) throw new Error('Specification exceeds the supported size.');
  const content = await readFile(absolutePath, 'utf8');
  return { path, absolutePath, content, hash: hash(content) };
}

export function selectRequirement(file: PreparedFile, title: string) {
  const selected = parseSpecification(file.content).find(item => item.title === title);
  if (!selected) throw new Error('Selected requirement is missing. Import it again or use the prepared requirement.');
  const content = `${selected.text}\n\nSource: ${file.path}\nSource revision: ${file.hash}`;
  if (content.length > 20_000) throw new Error('Selected requirement exceeds the supported size.');
  return {
    file: { ...file, content, hash: hash(content) },
    requirement: { id: `imported-${hash(file.path + '\n' + title)}`, revision: hash(content), text: content, sourcePath: file.path, sourceRevision: file.hash, title, scenarios: selected.scenarios, checksAvailable: false },
  };
}
