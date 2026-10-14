import { expect, test } from 'vitest';
import { activityPoints, savedPredictionCount } from './src/activity.js';
import { newProjectState, projectTransition } from './src/project-learning.js';
const projectId = 'a'.repeat(64);
const source = {projectId,fileId:'b'.repeat(64),path:'example.py',language:'Python',startLine:1,endLine:1,text:'return value',sourceHash:'c'.repeat(64),truncated:false,capturedAt:new Date().toISOString(),fileBytes:12};
test('activity rewards decisions rather than saves and deduplicates preserved historical evidence', () => {
 let state = projectTransition(newProjectState(projectId), {type:'start',source,requirement:'Return the given value.',caseInput:'Pass the number eleven.'});
 expect(activityPoints(state)).toBe(0);
 state = projectTransition(state,{type:'predict',text:'Eleven is returned.',reasoning:'The code returns the value.'});
 expect(activityPoints(state)).toBe(10);
 expect(savedPredictionCount(state)).toBe(1);
 state = {...state,history:[{...state.attempt!,id:crypto.randomUUID()}]};
 expect(activityPoints(state)).toBe(10);
 expect(savedPredictionCount(state)).toBe(1);
});

test('source refresh retains one prediction and the accepted verification as history', () => {
 let state = projectTransition(newProjectState(projectId), {type:'start',source,requirement:'Return the given value.',caseInput:'Pass the number eleven.'});
 state = projectTransition(state,{type:'predict',text:'Eleven is returned.',reasoning:'The code returns the value.'});
 state = projectTransition(state,{type:'observe',text:'Eleven was observed in the local check.',source});
 state = projectTransition(state,{type:'refresh',source});
 state = projectTransition(state,{type:'verifyManual',description:'Manual local case inspection.',evidence:'Only the eleven case was inspected.',verdict:'uncertain',reason:'Other cases remain unchecked.',assistance:'No additional assistance.'});
 state = projectTransition(state,{type:'refresh',source:{...source,text:'return other',sourceHash:'d'.repeat(64)}});
 expect(state.history[0].verification?.kind).toBe('manual');
 expect(savedPredictionCount(state)).toBe(1);
 expect(activityPoints(state)).toBe(25);
});
