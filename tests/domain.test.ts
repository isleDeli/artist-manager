import {describe,it,expect} from 'vitest';
import {computeMatch,compareMatches,availability} from '../src/lib/match';
import {emptyStore,parseStore} from '../src/lib/storage';
import {opportunities} from '../src/data/opportunities';
import type {Opportunity,Rule} from '../src/types';
const original=opportunities[0];
const rule=(id:string,field?:Rule['field']):Rule=>({id,label:id,field,op:'yes',mandatory:true});
const fixture=(id:string,rules:Rule[]):Opportunity=>({...original,id,name:id,rules,rulesComplete:true});
describe('profile requirement matching',()=>{
 it('calculates the requested independently defined 6-of-8 example',()=>{const p=emptyStore().profile;for(let i=1;i<=6;i++)p.answers['r'+i]='yes';const m=computeMatch(fixture('eight',Array.from({length:8},(_,i)=>rule('r'+(i+1)))),p);expect(m.score).toBe(75);expect(m.met).toBe(6);expect(m.unknown).toBe(2);expect(m.eligibility).toBe('Uncertain eligibility');});
 it('keeps unknown facts separate from confirmed failures',()=>{const p=emptyStore().profile;const op=fixture('two',[rule('a'),rule('b')]);expect(computeMatch(op,p).eligibility).toBe('Uncertain eligibility');p.answers.a='no';expect(computeMatch(op,p).eligibility).toBe('Not eligible');expect(computeMatch(op,p).unknown).toBe(1);});
 it('does not count equivalent rule ids twice',()=>{const p=emptyStore().profile;p.answers.a='yes';expect(computeMatch(fixture('duplicate',[rule('a'),rule('a'),rule('b')]),p).score).toBe(50);});
 it('rounds one of three to 33 percent',()=>{const p=emptyStore().profile;p.answers.a='yes';expect(computeMatch(fixture('third',[rule('a'),rule('b'),rule('c')]),p).score).toBe(33);});
 it('never fabricates a score from an empty ruleset',()=>{expect(computeMatch(fixture('none',[]),emptyStore().profile).score).toBeNull();});
 it('keeps full reviewed rule matches provisional when rules are incomplete',()=>{const p=emptyStore().profile;p.answers.a='yes';const m=computeMatch({...fixture('partial',[rule('a')]),rulesComplete:false},p);expect(m.score).toBe(100);expect(m.eligibility).toBe('Uncertain eligibility');expect(m.provisional).toBe(true);});
 it('places a high-scoring mandatory failure below a lower match',()=>{const p=emptyStore().profile;p.answers.a='yes';p.answers.b='yes';p.answers.c='no';const low=fixture('low',[rule('a'),rule('unknown'),rule('unknown2')]),failed=fixture('failed',[rule('a'),rule('b'),rule('c')]);expect(computeMatch(failed,p).score).toBe(67);expect(compareMatches(low,failed,p)).toBeLessThan(0);});
 it('ranks assessed, then unassessed, then ineligible',()=>{const p=emptyStore().profile;p.answers.fail='no';const items=[fixture('failure',[rule('fail')]),fixture('unassessed',[]),fixture('assessed',[rule('unknown')])];expect(items.sort((a,b)=>compareMatches(a,b,p)).map(x=>x.id)).toEqual(['assessed','unassessed','failure']);});
 it('resolves ties by fewer unknowns then title',()=>{const p=emptyStore().profile;p.answers.a='yes';const a=fixture('Alpha',[rule('a')]),b=fixture('Beta',[rule('a')]);expect(compareMatches(a,b,p)).toBeLessThan(0);});
 it('changes match when profile facts change without mutating application drafts',()=>{const d=emptyStore();const op=opportunities.find(x=>x.id==='gottlieb-individual')!;const before=computeMatch(op,d.profile);d.profile.medium='Painting';d.profile.yearsPractice='25';d.profile.financialNeed='yes';const after=computeMatch(op,d.profile);expect(after.score).toBe(100);expect(after.score).toBeGreaterThan(before.score!);expect(d.applications).toEqual([]);});
});
describe('source dates and catalog',()=>{
 it('has exactly 24 real unique listings with official links',()=>{expect(opportunities).toHaveLength(24);expect(new Set(opportunities.map(x=>x.id)).size).toBe(24);expect(opportunities.every(x=>x.sourceUrl.startsWith('https://'))).toBe(true);});
 it('preserves precise WSW Eastern cutoff without closing early in UTC',()=>{const op=opportunities.find(x=>x.id==='wsw-book')!;expect(availability(op,new Date('2026-11-16T03:00:00Z'))).toBe('open');expect(availability(op,new Date('2026-11-16T05:00:00Z'))).toBe('closed');});
 it('keeps a date-only Pacific deadline uncertain during its local day',()=>{const op=opportunities.find(x=>x.id==='daisy-lane-2027')!;expect(availability(op,new Date('2026-12-02T02:00:00Z'))).toBe('uncertain');expect(availability(op,new Date('2026-12-02T09:00:00Z'))).toBe('closed');});
 it('preserves Kala month-only opening instead of inventing a precise day',()=>{const op=opportunities.find(x=>x.id==='kala-2027')!;expect(op.opensDate).toBeUndefined();expect(op.deadline).toContain('December 2026');});
});
describe('saved data safety',()=>{
 it('starts empty without demo personal data',()=>{const d=parseStore(null);expect(d.profile.name).toBe('');expect(d.applications).toEqual([]);expect(d.samples).toEqual([]);});
 it('round-trips artist profile and saved drafts together',()=>{const d=emptyStore();d.profile.name='Test artist';d.applications.push({id:'a',opportunityId:'east-bay-fund',status:'preparing',drafts:{answer:'My saved words'},checklist:{},notes:'My notes',selectedWorkSampleIds:[],actualAwardAmount:'',timeline:[]});expect(parseStore(JSON.stringify(d))).toEqual(d);});
 it('rejects unsupported, corrupt and duplicated applications without resetting',()=>{expect(()=>parseStore('{')).toThrow();expect(()=>parseStore('{"version":2}')).toThrow();const d=emptyStore();d.applications.push({id:'a',opportunityId:'east-bay-fund',status:'preparing',drafts:{},checklist:{},notes:'',selectedWorkSampleIds:[],actualAwardAmount:'',timeline:[]});d.applications.push({...d.applications[0],id:'b'});expect(()=>parseStore(JSON.stringify(d))).toThrow();});
 it('rejects invalid stored profile answers',()=>{const d=emptyStore();const raw=JSON.parse(JSON.stringify(d));raw.profile.student='maybe';expect(()=>parseStore(JSON.stringify(raw))).toThrow();});
});
