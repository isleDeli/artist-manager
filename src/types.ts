export type Answer = '' | 'yes' | 'no';
export type Profile = {name:string;city:string;county:string;country:string;medium:string;careerStage:string;age:string;yearsPractice:string;exhibitions:string;student:Answer;sponsor:Answer;signedAgreement:Answer;financialNeed:Answer;hasChildren:Answer;formerlyIncarcerated:Answer;bio:string;statement:string;website:string;cv:string;projectTitle:string;projectDescription:string;projectBudget:string;projectTimeline:string;answers:Record<string,Answer>};
export type Rule = {id:string;label:string;field?:keyof Profile;op?:'oneOf'|'min'|'yes'|'no';values?:string[];minimum?:number;mandatory:boolean};
export type Opportunity = {id:string;name:string;provider:string;type:string;location:string;support:string;availability:string;deadline:string;fees:string;description:string;caveats:string;sourceUrl:string;sourceReviewedAt:string;rules:Rule[];rulesComplete:boolean;materials:string[];exactDeadline?:string;deadlineDate?:string;deadlineTimeZone?:string;opensDate?:string;amount?:number;disciplines:string[];emergency?:boolean};
export type Status='saved'|'preparing'|'ready'|'submitted'|'awarded'|'declined';
export type Application={id:string;opportunityId:string;status:Status;drafts:Record<string,string>;checklist:Record<string,boolean>;notes:string;selectedWorkSampleIds:string[];timeline:{at:string;text:string}[];actualAwardAmount:string};
export type WorkSample={id:string;title:string;year:string;medium:string;thumbnail:string};
export type Store={version:1;profile:Profile;bookmarks:string[];applications:Application[];samples:WorkSample[]};
