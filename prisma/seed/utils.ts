import type { PrismaClient } from '@prisma/client';

export function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function generateUniqueSlug(
  prisma: PrismaClient,
  baseTitle: string,
  opts: { maxTries?: number; suffixLen?: number } = {}
) {
  const { maxTries = 10, suffixLen = 6 } = opts;
  const base = slugify(baseTitle).slice(0, 64); // seguridad por longitud
  // 1er intento: base + 4 dígitos (siembra rápida)
  let candidate = `${base}-${Math.floor(1000 + Math.random() * 9000)}`;

  for (let i = 0; i < maxTries; i++) {
    const exists = await prisma.course.findUnique({
      where: { slug: candidate },
    });
    if (!exists) return candidate;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const suffix = [...Array(suffixLen)]
      .map(() => Math.random().toString(36)[2])
      .join('');
    candidate = `${base}-${suffix}`;
  }
  // Último recurso (extremadamente improbable llegar aquí)
  return `${base}-${Date.now()}`;
}
