import { computeMatch } from './match';
import type { Opportunity, Profile, WorkSample } from '../types';

export type GrantFact = { id: string; label: string; value: string };
export type GrantRequirement = { id: string; label: string; state: 'met' | 'not met' | 'unknown'; evidenceFactIds: string[] };
export type GrantRequest = {
  artist: { name: string; facts: GrantFact[] };
  opportunity: { name: string; description: string; sourceUrl: string; caveats: string; rulesComplete: boolean };
  requirements: GrantRequirement[];
  workSamples: { id: string; title: string; year: string; medium: string }[];
  question: string; guidelines: string; wordLimit: number; demo: boolean;
};
export type GrantResult = {
  strategy: string; draft: string; coverage: { requirementId: string; status: 'addressed' | 'not_addressed'; evidenceFactIds: string[]; excerpt: string }[];
  questions: string[]; warnings: string[]; model: string; wordCount: number;
};
export type ContextOptions = { background: boolean; bio: boolean; statement: boolean; project: boolean; applicationDrafts?: boolean };
const backgroundLabels: Record<string, string> = {
  name: 'Artist name', city: 'City or studio location', county: 'County answer', country: 'Country answer',
  medium: 'Primary medium', careerStage: 'Career stage', age: 'Age', yearsPractice: 'Years of mature practice',
  exhibitions: 'Qualifying exhibitions in the last ten years', student: 'Degree enrollment answer',
  sponsor: 'Fiscal sponsor answer', signedAgreement: 'Signed sponsorship agreement answer',
  financialNeed: 'Financial need answer', hasChildren: 'Parent eligibility answer', formerlyIncarcerated: 'Formerly incarcerated artist answer',
  website: 'Artist website (reference only)', cv: 'CV link (reference only; contents not fetched)',
};

export function buildGrantRequest(op: Opportunity, profile: Profile, samples: WorkSample[], options: ContextOptions, settings: { question: string; guidelines: string; wordLimit: number; demo: boolean }, applicationDrafts: Record<string, string> = {}): GrantRequest {
  const facts: GrantFact[] = [];
  const add = (id: string, label: string, value: string) => { if (value.trim()) facts.push({ id, label, value: value.trim() }); };
  if (options.background) {
    for (const [id, label] of Object.entries(backgroundLabels)) add(id, label, String(profile[id as keyof Profile] ?? ''));
    for (const rule of op.rules) if (!rule.field && profile.answers[rule.id]) add('requirement:' + rule.id, rule.label, profile.answers[rule.id]);
  }
  if (options.bio) add('bio', 'Artist-provided biography or labeled demo summary', profile.bio);
  if (options.statement) add('statement', 'Artist statement or labeled demo practice summary', profile.statement);
  if (options.project) {
    add('projectTitle', 'Proposed project title', profile.projectTitle);
    add('projectDescription', 'Proposed project description', profile.projectDescription);
    add('projectBudget', 'Proposed budget', profile.projectBudget);
    add('projectTimeline', 'Proposed timeline', profile.projectTimeline);
  }
  if (options.applicationDrafts !== false) {
    add('application-project', 'Saved application project description — primary source for this application', applicationDrafts['Project description'] || '');
    add('application-statement', 'Saved application artist statement — primary source for this application', applicationDrafts['Artist statement'] || '');
    add('application-budget', 'Saved application budget narrative — preserve all figures and funding purposes', applicationDrafts['Budget narrative'] || '');
  }
  for (const work of samples) add('work:' + work.id, 'Selected work sample metadata', [work.title, work.medium, work.year].filter(Boolean).join(' · '));
  const available = new Set(facts.map(fact => fact.id));
  const requirements = computeMatch(op, profile).results.map(({ rule, state }, index) => {
    const id = rule.field ? rule.field : 'requirement:' + rule.id;
    return { id: 'requirement-' + (index + 1), label: rule.label, state: available.has(id) ? state : 'unknown' as const, evidenceFactIds: available.has(id) && state === 'met' ? [id] : [] };
  });
  return {
    artist: { name: options.background ? profile.name : '', facts },
    opportunity: { name: op.name, description: op.description, sourceUrl: op.sourceUrl, caveats: op.caveats, rulesComplete: op.rulesComplete },
    requirements, workSamples: samples.map(({ id, title, year, medium }) => ({ id, title, year, medium })),
    ...settings,
  };
}

export function normalizeBackendUrl(value: string): string {
  const url = new URL(value);
  if (url.username || url.password || url.search || url.hash || !['', '/'].includes(url.pathname)) throw new Error('Use the backend’s base URL, without a path, query, or credentials.');
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) throw new Error('Use an HTTPS backend URL.');
  return url.origin;
}

export function checkedGrantResult(value: unknown, request: GrantRequest): GrantResult {
  const r = value as GrantResult;
  if (!r || typeof r.strategy !== 'string' || typeof r.draft !== 'string' || !r.draft.trim() || typeof r.model !== 'string' || !Array.isArray(r.coverage) || !Array.isArray(r.questions) || !Array.isArray(r.warnings) || !r.questions.every(x => typeof x === 'string') || !r.warnings.every(x => typeof x === 'string')) throw new Error('The writer returned an invalid draft. Your saved answer has not changed.');
  const wordCount = r.draft.trim().split(/\s+/).length;
  if (wordCount > request.wordLimit) throw new Error('The proposed draft exceeds the word limit. Your saved answer has not changed.');
  const met = request.requirements.filter(rule => rule.state === 'met');
  const seen = new Set<string>();
  for (const row of r.coverage) {
    const rule = met.find(rule => rule.id === row.requirementId);
    if (!rule || seen.has(row.requirementId) || !['addressed', 'not_addressed'].includes(row.status) || !Array.isArray(row.evidenceFactIds) || row.evidenceFactIds.some(id => !rule.evidenceFactIds.includes(id)) || typeof row.excerpt !== 'string' || (row.status === 'addressed' && (!row.evidenceFactIds.length || !row.excerpt.trim() || !r.draft.includes(row.excerpt)))) throw new Error('The requirement coverage could not be validated. Your saved answer has not changed.');
    seen.add(row.requirementId);
  }
  if (seen.size !== met.length) throw new Error('The writer did not review every matched requirement. Your saved answer has not changed.');
  return { ...r, wordCount };
}
