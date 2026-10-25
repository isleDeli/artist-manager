import { describe, expect, it } from 'vitest';
import { buildGrantRequest, checkedGrantResult, normalizeBackendUrl } from '../src/lib/grant-plan';
import { emptyStore } from '../src/lib/storage';
import { opportunities } from '../src/data/opportunities';

describe('grant writer grounding and privacy', () => {
  const op = opportunities.find(item => item.id === 'gottlieb-individual')!;
  const selected = { background: true, bio: true, statement: true, project: true };
  const settings = { question: 'Describe the work', guidelines: '', wordLimit: 100, demo: false };
  it('does not promote missing artist information into supported requirements', () => {
    const request = buildGrantRequest(op, emptyStore().profile, [], selected, settings);
    expect(request.requirements.every(rule => rule.state === 'unknown')).toBe(true);
    expect(request.artist.facts).toEqual([]);
  });
  it('keeps confirmed failures and unknowns out of supported evidence', () => {
    const profile = emptyStore().profile;
    profile.medium = 'Painting'; profile.yearsPractice = '2';
    const request = buildGrantRequest(op, profile, [], selected, settings);
    expect(request.requirements.filter(rule => rule.state === 'met')).toHaveLength(1);
    expect(request.requirements.some(rule => rule.state === 'not met')).toBe(true);
    expect(request.requirements.filter(rule => rule.state !== 'met').every(rule => !rule.evidenceFactIds.length)).toBe(true);
  });
  it('honors excluded private background fields and transmits sample metadata without image content', () => {
    const profile = emptyStore().profile; profile.financialNeed = 'yes'; profile.bio = 'My practice';
    const request = buildGrantRequest(op, profile, [{ id: 'one', title: 'Painting One', year: '2026', medium: 'Oil', thumbnail: 'data:image/png;base64,private-image' }], { ...selected, background: false }, settings);
    expect(request.artist.facts.some(fact => fact.id === 'financialNeed')).toBe(false);
    expect(request.requirements.every(rule => rule.state === 'unknown')).toBe(true);
    expect(JSON.stringify(request)).not.toContain('private-image');
    expect(request.workSamples[0].title).toBe('Painting One');
  });
  it('validates literal draft excerpts and evidence for every met requirement', () => {
    const profile = emptyStore().profile; profile.medium = 'Painting';
    const request = buildGrantRequest(op, profile, [], selected, settings);
    const met = request.requirements.find(rule => rule.state === 'met')!;
    const result = { strategy: 'Lead with practice', draft: 'I work in painting.', coverage: [{ requirementId: met.id, status: 'addressed', evidenceFactIds: ['medium'], excerpt: 'I work in painting.' }], questions: [], warnings: [], model: 'test-model', wordCount: 0 };
    expect(checkedGrantResult(result, request).wordCount).toBe(4);
    expect(() => checkedGrantResult({ ...result, coverage: [{ ...result.coverage[0], excerpt: 'I won an award.' }] }, request)).toThrow();
    expect(() => checkedGrantResult({ ...result, coverage: [{ ...result.coverage[0], evidenceFactIds: ['financialNeed'] }] }, request)).toThrow();
    expect(() => checkedGrantResult({ ...result, coverage: [] }, request)).toThrow();
    expect(() => checkedGrantResult({ ...result, draft: 'word '.repeat(101) }, request)).toThrow();
  });
  it('requires HTTPS except for explicit local development and rejects embedded credentials', () => {
    expect(normalizeBackendUrl('https://my-service.onrender.com/')).toBe('https://my-service.onrender.com');
    expect(normalizeBackendUrl('http://localhost:8787')).toBe('http://localhost:8787');
    expect(() => normalizeBackendUrl('http://untrusted.example')).toThrow();
    expect(() => normalizeBackendUrl('https://name:password@example.com')).toThrow();
    expect(() => normalizeBackendUrl('https://example.com/api')).toThrow();
  });
});


describe('catalog requirement transport IDs', () => {
  it('keeps every real opportunity within backend identifier limits without changing stored rule IDs', () => {
    const profile = emptyStore().profile;
    for (const op of opportunities) {
      const originalIds = op.rules.map(rule => rule.id);
      const request = buildGrantRequest(op, profile, [], { background: true, bio: true, statement: true, project: true }, { question: 'Describe the project', guidelines: '', wordLimit: 500, demo: true });
      expect(request.requirements.every(rule => rule.id.length > 0 && rule.id.length <= 120)).toBe(true);
      expect(new Set(request.requirements.map(rule => rule.id)).size).toBe(request.requirements.length);
      expect(request.artist.facts.every(fact => fact.id.length <= 120)).toBe(true);
      expect(op.rules.map(rule => rule.id)).toEqual(originalIds);
    }
  });
});


describe('application section synthesis', () => {
  const op = opportunities[0];
  const options = { background: false, bio: false, statement: false, project: false, applicationDrafts: true };
  const settings = { question: 'Combine the supplied material', guidelines: '', wordLimit: 500, demo: true };
  it('includes the actual saved project, statement and budget instead of only portfolio text', () => {
    const sections = {
      'Project description': 'Create six paintings for an Oakland exhibition.',
      'Artist statement': 'My work explores belonging through layered pigments.',
      'Budget narrative': 'Request $8,500: $6,000 artist fees and $2,500 materials.',
      'ai:guidelines': 'Do not send this setting as artist evidence.',
    };
    const before = { ...sections };
    const request = buildGrantRequest(op, emptyStore().profile, [], options, settings, sections);
    expect(request.artist.facts.map(fact => fact.id)).toEqual(['application-project', 'application-statement', 'application-budget']);
    expect(request.artist.facts.map(fact => fact.value)).toEqual([sections['Project description'], sections['Artist statement'], sections['Budget narrative']]);
    expect(request.artist.facts.some(fact => fact.value.includes('Do not send'))).toBe(false);
    expect(sections).toEqual(before);
    expect(request.requirements.every(rule => rule.state === 'unknown')).toBe(true);
  });
  it('allows excluding application sections and does not fabricate missing ones', () => {
    const sections = { 'Project description': 'My saved project', 'Budget narrative': '' };
    expect(buildGrantRequest(op, emptyStore().profile, [], options, settings, sections).artist.facts).toHaveLength(1);
    expect(buildGrantRequest(op, emptyStore().profile, [], { ...options, applicationDrafts: false }, settings, sections).artist.facts).toEqual([]);
  });
});
