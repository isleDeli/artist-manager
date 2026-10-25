import { GRANT_API_URL } from '../config';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { buildGrantRequest, checkedGrantResult, normalizeBackendUrl, type ContextOptions, type GrantRequest, type GrantResult } from '../lib/grant-plan';
import type { Application, Opportunity, Profile, WorkSample } from '../types';
import '../grant-writer.css';

let sessionAccessCode = '';
const apiStorageKey = 'artist-manager:grant-api-url';
function initialEndpoint() {
  try { return localStorage.getItem(apiStorageKey) || import.meta.env.VITE_GRANT_API_URL || GRANT_API_URL; } catch { return import.meta.env.VITE_GRANT_API_URL || GRANT_API_URL; }
}
type Props = {
  op: Opportunity; profile: Profile; app: Application; samples: WorkSample[]; section: string; draft: string; demo: boolean;
  onDraft: (value: string) => void; onSettings: (values: Record<string, string>) => void;
};

export default function GrantWriter({ op, profile, app, samples, section, draft, demo, onDraft, onSettings }: Props) {
  const [endpoint, setEndpoint] = useState(initialEndpoint);
  const [accessCode, setAccessCode] = useState(sessionAccessCode);
  const [connected, setConnected] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [options, setOptions] = useState<ContextOptions>({ background: true, bio: true, statement: true, project: true });
  const [proposal, setProposal] = useState<{ result: GrantResult; request: GrantRequest } | null>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const questionKey = 'ai:question:' + section;
  const limitKey = 'ai:wordLimit:' + section;
  const question = app.drafts[questionKey] || '';
  const guidelines = app.drafts['ai:guidelines'] || '';
  const wordLimit = Number(app.drafts[limitKey] || '500');
  const selectedSamples = samples.filter(work => app.selectedWorkSampleIds.includes(work.id));
  const request = buildGrantRequest(op, profile, selectedSamples, options, {
    question: question.trim() || 'Optional preparation: ' + section,
    guidelines, wordLimit, demo,
  });
  const met = request.requirements.filter(rule => rule.state === 'met');
  const unanswered = request.requirements.filter(rule => rule.state === 'unknown');
  const failed = request.requirements.filter(rule => rule.state === 'not met');

  const checkConnection = async () => {
    setError(''); setBusy('Connecting…'); setConnected(false);
    try {
      const base = normalizeBackendUrl(endpoint.trim());
      controller.current?.abort();
      controller.current = new AbortController();
      const timer = setTimeout(() => controller.current?.abort(), 120000);
      try {
        const response = await fetch(base + '/health', { signal: controller.current.signal });
        const health = await response.json();
        if (!response.ok || health.status !== 'ok' || !health.configured) throw new Error('The backend is reachable but not configured. Set its OpenAI API key and grant-writer access code in the hosting dashboard.');
        setEndpoint(base); setConnected(true);
        try { localStorage.setItem(apiStorageKey, base); } catch { /* Connection still works without persistence. */ }
      } finally { clearTimeout(timer); }
    } catch (e) { setError(e instanceof Error && e.name !== 'AbortError' ? e.message : 'The backend did not respond in time. Free instances may need a minute to wake; try Check connection again.'); }
    finally { setBusy(''); }
  };

  const generate = async () => {
    setError('');
    if (!connected || !consent) { setError('Connect the backend and approve the selected information before drafting.'); return; }
    if (accessCode.trim().length < 16 || accessCode.trim().startsWith('sk-')) { setError('Enter the backend access code you chose on Render, not your OpenAI API key. It must have at least 16 characters.'); return; }
    if (!Number.isInteger(wordLimit) || wordLimit < 50 || wordLimit > 1500) { setError('Choose a word limit between 50 and 1,500.'); return; }
    if (!request.artist.facts.length) { setError('Add or select some artist information before requesting a draft.'); return; }
    setBusy('Planning and drafting…');
    controller.current?.abort(); controller.current = new AbortController();
    const timer = setTimeout(() => controller.current?.abort(), 120000);
    try {
      const response = await fetch(normalizeBackendUrl(endpoint.trim()) + '/api/grant-draft', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessCode.trim() },
        body: JSON.stringify(request), signal: controller.current.signal,
      });
      const payload = await response.json();
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
    <p className="tiny">Build a focused draft around the requirements your information supports. Review its claims, fill the gaps and make it your own.</p>
    <div className="writer-plan">
      <strong>{met.length} requirements supported · {unanswered.length} need information{failed.length ? ' · ' + failed.length + ' not met' : ''}</strong>
      <p className="tiny">Based on reviewed catalog rules and the context selected below. A persuasive draft cannot remove an eligibility restriction.</p>
      {failed.length > 0 && <p className="writer-warning">Some mandatory requirements are not met. The writer must flag these and cannot claim the artist qualifies.</p>}
      <details><summary>Review the requirement plan</summary><ul>{request.requirements.map(rule => <li key={rule.id}><span>{rule.state === 'met' ? 'Supported' : rule.state === 'unknown' ? 'Need information' : 'Not met'}</span> {rule.label}</li>)}</ul>{!request.requirements.length && <p className="tiny">No detailed rules are available here. Paste the official description and questions below; the draft will remain provisional.</p>}<a className="text-link tiny" href={op.sourceUrl} target="_blank" rel="noopener noreferrer">Check the official requirements <ArrowUpRight size={14} /></a></details>
    </div>
    <fieldset disabled={!!busy} className="writer-inputs">
      <legend className="sr-only">Grant-writing inputs</legend>
      <label>Application question or preparation focus<textarea maxLength={4000} value={question} onChange={e => onSettings({ [questionKey]: e.target.value })} placeholder={'Paste the funder’s exact question, or describe what this ' + section.toLowerCase() + ' should cover.'} /></label>
      <label>Opportunity description and selection criteria<textarea maxLength={14000} value={guidelines} onChange={e => onSettings({ 'ai:guidelines': e.target.value })} placeholder="Paste relevant wording from the official opportunity. The writer will treat this as reference material, not invent additional eligibility facts." /></label>
      <label>Maximum draft length (words)<input type="number" min={50} max={1500} value={app.drafts[limitKey] || '500'} onChange={e => onSettings({ [limitKey]: e.target.value })} /></label>
      <p className="tiny">The default 500-word limit is your drafting target, not a verified funder limit. Confirm the official limit before submitting.</p>
      <div className="context-options">{([
        ['background', 'Artist background and eligibility answers'],
        ['bio', 'Artist bio'], ['statement', 'Artist statement'], ['project', 'Project description, budget and timeline'],
      ] as const).map(([key, label]) => <label key={key}><input type="checkbox" checked={options[key]} onChange={e => { setOptions({ ...options, [key]: e.target.checked }); setConsent(false); }} />{label}</label>)}</div>
      <p className="tiny">{selectedSamples.length} selected work samples: metadata only. Images, original files and linked CV contents are not sent.</p>
      <details className="writer-context"><summary>Preview the information to send</summary>{request.artist.facts.length ? request.artist.facts.map(fact => <div key={fact.id}><strong>{fact.label}</strong><p>{fact.value}</p></div>) : <p>No artist information selected.</p>}</details>
    </fieldset>
    <details className="writer-connection" open={!connected}>
      <summary>{connected ? 'Backend connected · connection settings' : 'Connect your AI backend'}</summary>
      <p className="tiny">Your OpenAI key belongs only in the backend host’s environment settings. Use the separate backend access code here.</p>
      <label>Backend URL<input type="url" value={endpoint} disabled={!!busy} onChange={e => { setEndpoint(e.target.value); setConnected(false); setConsent(false); }} placeholder="https://your-grant-writer.onrender.com" /></label>
      <label>Backend access code<input type="password" autoComplete="off" value={accessCode} disabled={!!busy} onChange={e => { sessionAccessCode = e.target.value; setAccessCode(e.target.value); }} placeholder="The access code you chose for this backend" /></label>
      <button className="pill" disabled={!!busy || !endpoint.trim()} onClick={() => void checkConnection()}>Check connection</button>
      <a className="text-link tiny" href="https://github.com/isleDeli/artist-manager/blob/main/docs/ai-backend-setup.md" target="_blank" rel="noopener noreferrer">Backend setup instructions <ArrowUpRight size={14} /></a>
    </details>
    <label className="writer-consent"><input type="checkbox" checked={consent} disabled={!!busy} onChange={e => setConsent(e.target.checked)} /><span>Send the selected information, question and opportunity description to this backend and OpenAI to draft this answer. API usage is billed to my OpenAI account.</span></label>
    <button className="button" onClick={() => void generate()} disabled={!!busy || !connected || !consent}><Sparkles size={16} />{busy || 'Plan and draft this answer'}</button>
    <p className="tiny" role="status" aria-live="polite">{busy || (connected ? 'Backend connected. Generated text will appear as a proposal before you insert it.' : 'Live AI is not connected yet. Add your backend URL above to enable drafting.')}</p>
    {error && <p className="error-text" role="alert">{error}</p>}
    {proposal && <div className="writer-proposal">
      <p className="eyebrow">AI proposal / review before using</p>
      <h3>Writing plan</h3><p>{proposal.result.strategy}</p>
      <h3>Proposed answer</h3><pre>{proposal.result.draft}</pre>
      <p className="tiny">{proposal.result.wordCount} words · {proposal.result.model} · Based on the selected facts at generation time. Verify all claims before submitting.</p>
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
