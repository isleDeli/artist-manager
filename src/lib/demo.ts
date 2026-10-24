import { emptyStore, parseStore, STORAGE_KEY } from './storage';
import type { Store } from '../types';

export const DEMO_STORAGE_KEY = 'artist-manager:demo:taylor-smalls:v1';
export const ACTIVE_WORKSPACE_KEY = 'artist-manager:active-workspace';
export const demoWorks = [
  { id: 'taylor-glaucous-1', title: 'Glaucous 1', file: 'glaucous-1.jpg', sourceUrl: 'https://www.taylorsmalls.com/glaucous1' },
  { id: 'taylor-susurrus', title: 'Susurrus', file: 'susurrus.jpg', sourceUrl: 'https://www.taylorsmalls.com/susurrus' },
  { id: 'taylor-nunchi', title: 'Nunchi', file: 'nunchi.png', sourceUrl: 'https://www.taylorsmalls.com/nunchi' },
];

export function createTaylorDemo(thumbnails: string[]): Store {
  if (thumbnails.length !== demoWorks.length || thumbnails.some(image => !image.startsWith('data:image/'))) {
    throw new Error('The demo artwork could not be loaded. Please try again.');
  }
  const data = emptyStore();
  data.profile = {
    ...data.profile,
    name: 'Taylor Smalls',
    city: 'Oakland, California',
    medium: 'Painting',
    website: 'https://www.taylorsmalls.com/',
    cv: 'https://www.taylorsmalls.com/about-cv',
    bio: 'Taylor Smalls is a contemporary portrait artist based in Oakland, California. She specializes in palette knife painting and water washing. Her layered use of color celebrates Black and Brown women. She has worked as a painter since 2012 and holds a BA in Architecture from the University of San Francisco.',
    statement: 'Demo summary of Taylor’s published practice, not a quotation: Through layered pigment and texture, the work explores the depth and varied tones of Black and Brown skin and celebrates women of color.',
  };
  data.samples = demoWorks.map((work, index) => ({
    id: work.id, title: work.title, year: '', medium: 'Acrylic on stretched canvas', thumbnail: thumbnails[index],
  }));
  return data;
}

export async function loadTaylorArtwork(baseUrl: string): Promise<string[]> {
  return Promise.all(demoWorks.map(async work => {
    const response = await fetch(baseUrl + 'artists/taylor-smalls/' + work.file);
    if (!response.ok) throw new Error('The demo artwork could not be loaded. Please try again.');
    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) throw new Error('The demo artwork could not be loaded. Please try again.');
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('The demo artwork could not be loaded. Please try again.'));
      reader.readAsDataURL(blob);
    });
  }));
}

export function readWorkspace(storage: Pick<Storage, 'getItem'>) {
  const key = storage.getItem(ACTIVE_WORKSPACE_KEY) === 'taylor-smalls' ? DEMO_STORAGE_KEY : STORAGE_KEY;
  return { key, data: parseStore(storage.getItem(key)) };
}

export function persistWorkspace(storage: Pick<Storage, 'setItem'>, key: string, data: Store) {
  storage.setItem(key, JSON.stringify(data));
  storage.setItem(ACTIVE_WORKSPACE_KEY, key === DEMO_STORAGE_KEY ? 'taylor-smalls' : 'personal');
}
