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
