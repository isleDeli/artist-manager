import type {Opportunity,Profile,Rule} from '../types';
export type RuleResult={rule:Rule;state:'met'|'not met'|'unknown';value:string};
export function assess(rule:Rule,profile:Profile):RuleResult {
 const raw=rule.field ? profile[rule.field] : profile.answers[rule.id];
 const value=typeof raw==='string'?raw:'';
 if(value==='')return {rule,state:'unknown',value};
 let met:boolean;
 if(!rule.field)met=value==='yes';
 else if(rule.op==='min'){const n=Number(value);if(!Number.isFinite(n)||n<0)return {rule,state:'unknown',value};met=n>=(rule.minimum??0);}
 else if(rule.op==='oneOf')met=(rule.values??[]).some(v=>v.toLowerCase()===value.trim().toLowerCase());
 else met=value===(rule.op==='no'?'no':'yes');
 return {rule,state:met?'met':'not met',value};
}
export function computeMatch(opportunity:Opportunity,profile:Profile){
 const rules=[...new Map(opportunity.rules.map(r=>[r.id,r])).values()];
 const results=rules.map(r=>assess(r,profile));
 const met=results.filter(r=>r.state==='met').length;
 const unknown=results.filter(r=>r.state==='unknown').length;
 const failed=results.some(r=>r.rule.mandatory&&r.state==='not met');
 const eligibility=failed?'Not eligible':opportunity.rulesComplete&&unknown===0&&results.length?'Eligible':'Uncertain eligibility';
 return {results,met,unknown,total:results.length,score:results.length?Math.round(100*met/results.length):null,eligibility,provisional:!opportunity.rulesComplete};
}
export function compareMatches(a:Opportunity,b:Opportunity,profile:Profile){
 const x=computeMatch(a,profile),y=computeMatch(b,profile);
 const rank=(m:typeof x)=>m.eligibility==='Not eligible'?2:m.score===null?1:0;
 return rank(x)-rank(y)||(y.score??-1)-(x.score??-1)||x.unknown-y.unknown||a.name.localeCompare(b.name);
}
export function availability(op:Opportunity,now=new Date()){
 if(op.exactDeadline&&now.getTime()>Date.parse(op.exactDeadline))return 'closed';
 const day=new Intl.DateTimeFormat('en-CA',{timeZone:op.deadlineTimeZone??'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 if(op.deadlineDate&&day>op.deadlineDate)return 'closed';
 if(op.opensDate&&day<op.opensDate)return 'upcoming';
 if(op.availability==='upcoming'&&op.opensDate&&day>=op.opensDate)return 'uncertain';
 if(op.availability==='open'&&op.deadlineDate&&day===op.deadlineDate&&!op.exactDeadline)return 'uncertain';
 return op.availability;
}
