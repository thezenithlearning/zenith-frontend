// Tiny server-side fetch helper used by generateMetadata on public detail pages.

const base = (): string => {
  const raw = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').trim().replace(/\/+$/, '');
  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
};

export async function fetchPublic<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${base()}${path}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    return null;
  }
}
