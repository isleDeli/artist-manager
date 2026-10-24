import { describe, expect, it } from 'vitest';
import { ACTIVE_WORKSPACE_KEY, DEMO_STORAGE_KEY, createTaylorDemo, persistWorkspace, readWorkspace } from '../src/lib/demo';
import { emptyStore, STORAGE_KEY } from '../src/lib/storage';

function memoryStorage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}
const images = ['data:image/jpeg;base64,one', 'data:image/jpeg;base64,two', 'data:image/png;base64,three'];

describe('Taylor demo workspace isolation', () => {
  it('keeps personal drafts intact across demo edits and restoration', () => {
    const storage = memoryStorage();
    const personal = emptyStore();
    personal.profile.name = 'My own profile';
    personal.applications.push({ id: 'my-draft', opportunityId: 'east-bay-fund', status: 'preparing', drafts: { answer: 'Keep these words' }, checklist: {}, notes: '', selectedWorkSampleIds: [], actualAwardAmount: '', timeline: [] });
    persistWorkspace(storage, STORAGE_KEY, personal);
    const demo = createTaylorDemo(images);
    persistWorkspace(storage, DEMO_STORAGE_KEY, demo);
    demo.profile.bio = 'Edited during demo';
    persistWorkspace(storage, DEMO_STORAGE_KEY, demo);
    expect(readWorkspace(storage).data.profile.bio).toBe('Edited during demo');
    persistWorkspace(storage, STORAGE_KEY, personal);
    expect(readWorkspace(storage).data).toEqual(personal);
    expect(JSON.parse(storage.getItem(DEMO_STORAGE_KEY)!).profile.bio).toBe('Edited during demo');
  });
  it('leaves private and unverified eligibility facts unanswered', () => {
    const demo = createTaylorDemo(images);
    for (const field of ['age', 'county', 'country', 'yearsPractice', 'exhibitions', 'financialNeed', 'student', 'sponsor', 'signedAgreement', 'hasChildren', 'formerlyIncarcerated', 'projectBudget', 'projectDescription'] as const) expect(demo.profile[field]).toBe('');
    expect(demo.profile.answers).toEqual({});
    expect(demo.applications).toEqual([]);
    expect(demo.samples.map(work => work.title)).toEqual(['Glaucous 1', 'Susurrus', 'Nunchi']);
  });
  it('rejects incomplete artwork and preserves existing storage on failed writes', () => {
    expect(() => createTaylorDemo([])).toThrow();
    const storage = memoryStorage();
    persistWorkspace(storage, STORAGE_KEY, emptyStore());
    expect(() => persistWorkspace({ setItem: () => { throw new Error('Storage full'); } }, DEMO_STORAGE_KEY, createTaylorDemo(images))).toThrow();
    expect(storage.getItem(ACTIVE_WORKSPACE_KEY)).toBe('personal');
    expect(readWorkspace(storage).key).toBe(STORAGE_KEY);
  });
});
