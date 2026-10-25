import { GRANT_API_URL } from '../config';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { buildGrantRequest, checkedGrantResult, normalizeBackendUrl, type ContextOptions, type GrantRequest, type GrantResult } from '../lib/grant-plan';
import type { Application, Opportunity, Profile, WorkSample } from '../types';
import '../grant-writer.css';

type Props = {
  op: Opportunity; profile: Profile; app: Application; samples: WorkSample[]; section: string; draft: string; demo: boolean;
  onDraft: (value: string) => void; onSettings: (values: Record<string, string>) => void;
};

export default function GrantWriter({ op, profile, app, samples, section, draft, demo, onDraft, onSettings }: Props) {
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [options, setOptions] = useState<ContextOptions>({ background: true, bio: true, statement: true, project: true, applicationDrafts: true });
  const [proposal, setProposal] = useState<{ result: GrantResult; request: GrantRequest } | null>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const questionKey = 'ai:question:' + section;
  const limitKey = 'ai:wordLimit:' + section;
  const question = app.drafts[questionKey] || '';
  const guidelines = app.drafts['ai:guidelines'] || '';
  const wordLimit = Number(app.drafts[limitKey] || '500');
  const selectedSamples = samples.filter(work => app.selectedWorkSampleIds.includes(work.id));
  const sourceSections = ['Project description', 'Artist statement', 'Budget narrative'].filter(title => (app.drafts[title] || '').trim());
  const synthesisFocus = 'Write one cohesive, polished grant application answer by synthesizing the supplied saved application project description, artist statement, and budget narrative. Use all supplied sections that are relevant. Improve clarity, grammar, transitions and persuasive wording; remove repetition. Preserve the artist’s meaning, names, facts, project scope, budget amounts and funding uses. Prioritize these application-specific notes over generic portfolio summaries. If sources conflict, flag the conflict in questions or warnings instead of inventing a resolution. Keep within the word limit and address supported opportunity requirements. ';
  const request = buildGrantRequest(op, profile, selectedSamples, options, {
    question: synthesisFocus + (question.trim() ? 'Specific question to answer: ' + question.trim() : 'Create a combined application summary from the supplied material.'),
    guidelines, wordLimit, demo,
  }, app.drafts);
  const met = request.requirements.filter(rule => rule.state === 'met');
  const unanswered = request.requirements.filter(rule => rule.state === 'unknown');
  const failed = request.requirements.filter(rule => rule.state === 'not met');

  const generate = async () => {
    setError('');
    if (!consent) { setError('Approve using the selected information before drafting.'); return; }
    if (!Number.isInteger(wordLimit) || wordLimit < 50 || wordLimit > 1500) { setError('Choose a word limit between 50 and 1,500.'); return; }
    if (request.question.length > 4000) { setError('Shorten the application question to 3,000 characters so the writer can include the synthesis instructions.'); return; }
    const longSource = request.artist.facts.find(fact => fact.value.length > 4000);
    if (longSource) { setError(longSource.label + ' is longer than 4,000 characters. Shorten that section before requesting a combined answer.'); return; }
    if (!request.artist.facts.length) { setError('Add or select some artist information before requesting a draft.'); return; }
    setBusy('Planning and drafting…');
    controller.current?.abort(); controller.current = new AbortController();
    const timer = setTimeout(() => controller.current?.abort(), 120000);
    try {
      const response = await fetch(normalizeBackendUrl(import.meta.env.VITE_GRANT_API_URL || GRANT_API_URL) + '/api/grant-draft', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request), signal: controller.current.signal,
      });
      const payload = await response.json();
      if (response.status === 401) throw new Error('The grant writer is being updated. Please try again shortly. Your saved answer is unchanged.');
      if (!response.ok) throw new Error(payload?.error?.message || 'The writer could not generate a draft. Your saved answer has not changed.');
      setProposal({ result: checkedGrantResult(payload, request), request });
    } catch (e) { setError(e instanceof Error && e.name !== 'AbortError' ? e.message : 'Drafting timed out. Your saved answer is unchanged; you can try again.'); }
    finally { clearTimeout(timer); setBusy(''); }
  };

  const insert = (replace: boolean) => {
    if (!proposal) return;
    if (replace && draft && !window.confirm('Replace the saved answer with the proposed AI draft?')) return;
    onDraft(!replace && draft ? draft + '\n\n' + proposal.result.draft : proposal.result.draft);
  };

  return <section className="grant-writer" aria-labelledby="grant-writer-heading">
    <p className="eyebrow">Plan with your portfolio</p>
    <h3 id="grant-writer-heading"><Sparkles size={20} /> AI grant writer</h3>
    <p className="tiny">Combine your project description, artist statement and budget narrative into one clear, compelling proposed answer, tailored to the requirements your information supports.</p>
    <div className="writer-source-summary"><strong>Application material included</strong><p className="tiny">{options.applicationDrafts === false ? 'Saved application sections are excluded. Select “Combine all three saved application sections” below to include them.' : sourceSections.length ? sourceSections.join(' · ') : 'Write a short summary in the Project description, Artist statement and Budget narrative tabs above. Saved text from all three will be included automatically.'}</p><p className="tiny">Your source sections stay intact. The combined answer appears below for review before you insert it.</p></div>
    <div className="writer-plan">
      <strong>{met.length} requirements supported · {unanswered.length} need information{failed.length ? ' · ' + failed.length + ' not met' : ''}</strong>
      <p className="tiny">Based on reviewed catalog rules and the context selected below. A persuasive draft cannot remove an eligibility restriction.</p>
      {failed.length > 0 && <p className="writer-warning">Some mandatory requirements are not met. The writer must flag these and cannot claim the artist qualifies.</p>}
      <details><summary>Review the requirement plan</summary><ul>{request.requirements.map(rule => <li key={rule.id}><span>{rule.state === 'met' ? 'Supported' : rule.state === 'unknown' ? 'Need information' : 'Not met'}</span> {rule.label}</li>)}</ul>{!request.requirements.length && <p className="tiny">No detailed rules are available here. Paste the official description and questions below; the draft will remain provisional.</p>}<a className="text-link tiny" href={op.sourceUrl} target="_blank" rel="noopener noreferrer">Check the official requirements <ArrowUpRight size={14} /></a></details>
    </div>
    <fieldset disabled={!!busy} className="writer-inputs">
      <legend className="sr-only">Grant-writing inputs</legend>
      <label>Application question or preparation focus<textarea maxLength={3000} value={question} onChange={e => onSettings({ [questionKey]: e.target.value })} placeholder={'Paste the funder’s exact question, or describe what this ' + section.toLowerCase() + ' should cover.'} /></label>
      <label>Opportunity description and selection criteria<textarea maxLength={14000} value={guidelines} onChange={e => onSettings({ 'ai:guidelines': e.target.value })} placeholder="Paste relevant wording from the official opportunity. The writer will treat this as reference material, not invent additional eligibility facts." /></label>
      <label>Maximum draft length (words)<input type="number" min={50} max={1500} value={app.drafts[limitKey] || '500'} onChange={e => onSettings({ [limitKey]: e.target.value })} /></label>
      <p className="tiny">The default 500-word limit is your drafting target, not a verified funder limit. Confirm the official limit before submitting.</p>
      <div className="context-options">{([
        ['background', 'Artist background and eligibility answers'],
        ['bio', 'Portfolio bio'], ['statement', 'Portfolio artist statement'], ['project', 'Portfolio project details'], ['applicationDrafts', 'Combine all three saved application sections'],
      ] as const).map(([key, label]) => <label key={key}><input type="checkbox" checked={options[key]} onChange={e => { setOptions({ ...options, [key]: e.target.checked }); setConsent(false); }} />{label}</label>)}</div>
      <p className="tiny">{selectedSamples.length} selected work samples: metadata only. Images, original files and linked CV contents are not sent.</p>
      <details className="writer-context"><summary>Preview the information to send</summary>{request.artist.facts.length ? request.artist.facts.map(fact => <div key={fact.id}><strong>{fact.label}</strong><p>{fact.value}</p></div>) : <p>No artist information selected.</p>}</details>
    </fieldset>
    <label className="writer-consent"><input type="checkbox" checked={consent} disabled={!!busy} onChange={e => setConsent(e.target.checked)} /><span>Use the selected portfolio information and application details to prepare an AI draft. I’ll review the result before using it.</span></label>
    <button className="button" onClick={() => void generate()} disabled={!!busy || !consent}><Sparkles size={16} />{busy || 'Combine and polish application'}</button>
    <p className="tiny" role="status" aria-live="polite">{busy || 'Generated text appears as a proposal before you insert it. Your saved answer stays unchanged until you choose to use it.'}</p>
    {error && <p className="error-text" role="alert">{error}</p>}
    {proposal && <div className="writer-proposal">
      <p className="eyebrow">AI proposal / review before using</p>
      <h3>Writing plan</h3><p>{proposal.result.strategy}</p>
      <h3>Combined proposed answer</h3><pre>{proposal.result.draft}</pre>
      <p className="tiny">{proposal.result.wordCount} words · Based on the selected facts at generation time. Verify all claims before submitting.</p>
      <h3>Requirement coverage</h3>
      <ul>{proposal.result.coverage.map(row => <li key={row.requirementId}><strong>{proposal.request.requirements.find(rule => rule.id === row.requirementId)?.label}</strong><span className="tag">{row.status === 'addressed' ? 'Addressed in draft' : 'Not addressed'}</span>{row.excerpt && <blockquote>{row.excerpt}</blockquote>}</li>)}</ul>
      {!proposal.result.coverage.length && <p className="tiny">No known met requirements were available to certify as addressed.</p>}
      {proposal.result.questions.length > 0 && <><h3>Questions to strengthen the application</h3><ul>{proposal.result.questions.map((text, i) => <li key={i}>{text}</li>)}</ul></>}
      {proposal.result.warnings.length > 0 && <><h3>Check before applying</h3><ul>{proposal.result.warnings.map((text, i) => <li key={i}>{text}</li>)}</ul></>}
      <div className="actions"><button className="button" onClick={() => insert(false)}>{draft ? 'Append to saved answer' : 'Insert into answer'}</button>{draft && <button className="pill" onClick={() => insert(true)}>Replace saved answer</button>}<button className="text-button" onClick={() => setProposal(null)}>Discard proposal</button></div>
      <p className="tiny">Insertion saves the draft locally. Nothing is submitted to the funder.</p>
    </div>}
    <Link className="text-link tiny" to="/portfolio">Update your portfolio or project facts <ArrowUpRight size={14} /></Link>
  </section>;
}
