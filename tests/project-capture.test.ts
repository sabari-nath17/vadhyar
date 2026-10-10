import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
let root: string;
afterEach(async()=>{if(root) await rm(root,{recursive:true,force:true});});
async function capture(input: unknown) {
 const child=spawn(process.execPath,['scripts/capture-intent.mjs',root],{stdio:['pipe','ignore','ignore']});child.stdin.end(JSON.stringify(input));return await new Promise<number|null>(resolve=>child.once('exit',resolve));
}
it('records agent requests locally with restrictive permissions and stable event retry IDs',async()=>{
 root=await mkdtemp(join(tmpdir(),'vadhyar-capture-'));const event={id:'11111111-1111-4111-8111-111111111111',title:'Reminder',request:'Add reminders',expected:''};expect(await capture(event)).toBe(0);expect(await capture(event)).toBe(0);const path=join(root,'.vadhyar/intent-events.json');expect(JSON.parse(await readFile(path,'utf8'))).toHaveLength(1);expect((await stat(path)).mode&0o777).toBe(0o600);
});
it('rejects invalid and private-looking capture input',async()=>{
 root=await mkdtemp(join(tmpdir(),'vadhyar-capture-'));expect(await capture({title:'',request:'Test'})).not.toBe(0);expect(await capture({title:'Credentials',request:'api_key = "sk-proj-'+ 'x'.repeat(30)+'"'})).not.toBe(0);
});
