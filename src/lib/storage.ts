import type {Store,Profile} from '../types';
export const STORAGE_KEY='artist-manager:v1';
export const emptyProfile:Profile={name:'',city:'',county:'',country:'',medium:'',careerStage:'',age:'',yearsPractice:'',exhibitions:'',student:'',sponsor:'',signedAgreement:'',financialNeed:'',hasChildren:'',formerlyIncarcerated:'',bio:'',statement:'',website:'',cv:'',projectTitle:'',projectDescription:'',projectBudget:'',projectTimeline:'',answers:{}};
export function emptyStore():Store{return {version:1,profile:{...emptyProfile,answers:{}},bookmarks:[],applications:[],samples:[]};}
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const strings=(v:unknown):v is Record<string,string>=>object(v)&&Object.values(v).every(x=>typeof x==='string');
export function parseStore(raw:string|null):Store{
 if(raw===null)return emptyStore();const data:unknown=JSON.parse(raw);
 if(!object(data)||data.version!==1||!object(data.profile)||!strings(data.profile.answers)||!Array.isArray(data.bookmarks)||!data.bookmarks.every(x=>typeof x==='string')||!Array.isArray(data.applications)||!Array.isArray(data.samples))throw new Error('Saved data format is not supported. Your saved data has not been overwritten.');
 for(const key of Object.keys(emptyProfile).filter(k=>k!=='answers'))if(typeof data.profile[key]!=='string')throw new Error('Saved artist profile is damaged. Your saved data has not been overwritten.');
 if(!Object.values(data.profile.answers).every(x=>x===''||x==='yes'||x==='no'))throw new Error('Saved requirement answers are invalid.');
 for(const key of ['student','sponsor','signedAgreement','financialNeed','hasChildren','formerlyIncarcerated'])if(!['','yes','no'].includes(data.profile[key] as string))throw new Error('Saved profile answers are invalid.');
 const ids=new Set<string>(),grants=new Set<string>();
 for(const app of data.applications){if(!object(app)||typeof app.id!=='string'||typeof app.opportunityId!=='string'||!['saved','preparing','ready','submitted','awarded','declined'].includes(app.status as string)||!strings(app.drafts)||!object(app.checklist)||!Object.values(app.checklist).every(x=>typeof x==='boolean')||typeof app.notes!=='string'||typeof app.actualAwardAmount!=='string'||!Array.isArray(app.selectedWorkSampleIds)||!app.selectedWorkSampleIds.every(x=>typeof x==='string')||!Array.isArray(app.timeline)||!app.timeline.every(x=>object(x)&&typeof x.at==='string'&&typeof x.text==='string')||ids.has(app.id)||grants.has(app.opportunityId))throw new Error('Saved applications are damaged. Your saved data has not been overwritten.');ids.add(app.id);grants.add(app.opportunityId);}
 for(const sample of data.samples)if(!object(sample)||!['id','title','year','medium','thumbnail'].every(k=>typeof sample[k]==='string')||!(sample.thumbnail as string).startsWith('data:image/'))throw new Error('Saved work samples are damaged.');
 if(data.samples.length>8)throw new Error("Saved portfolio exceeds supported sample limit.");
 return data as unknown as Store;
}
