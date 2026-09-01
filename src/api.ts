import type {
  Category,
  CategoryWithOptions,
  Choice,
  Comparison,
  PreviewRow,
  User,
} from '../shared/types.ts';

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error ?? `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  users: () => fetch('/api/users').then(json<User[]>),

  setPhoto: (slug: string, dataUrl: string | null) =>
    fetch(`/api/users/${slug}/photo`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ dataUrl }),
    }).then(json<User>),

  categories: () => fetch('/api/categories').then(json<CategoryWithOptions[]>),

  choices: (slug: string) =>
    fetch(`/api/users/${slug}/choices`).then(json<Choice[]>),

  choose: (slug: string, categorySlug: string, optionId: string) =>
    fetch(`/api/users/${slug}/choices/${categorySlug}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ optionId }),
    }).then(json<{ categorySlug: string; optionId: string | null }>),

  chooseCustom: (slug: string, categorySlug: string, customName: string) =>
    fetch(`/api/users/${slug}/choices/${categorySlug}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ customName }),
    }).then(json<{ categorySlug: string; customName: string | null }>),

  preview: (slug: string) =>
    fetch(`/api/users/${slug}/preview`).then(
      json<{ user: User; total: number; answered: number; rows: PreviewRow[] }>,
    ),

  setChoiceImage: (slug: string, categorySlug: string, dataUrl: string | null) =>
    fetch(`/api/users/${slug}/choices/${categorySlug}/image`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ dataUrl }),
    }).then(json<{ categorySlug: string; imageUrl: string | null }>),

  comparison: () => fetch('/api/comparison').then(json<Comparison>),
};
