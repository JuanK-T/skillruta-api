// prisma/seed/users.seeder.ts
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { slugify } from './utils'; // la de antes o la tuya

export async function ensureAdmin(prisma: PrismaClient) {
  const email = 'admin@skillruta.dev';
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return exists;

  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const name = email.split('@')[0];

  return prisma.user.create({
    data: { email, name, passwordHash, role: Role.ADMIN },
  });
}

export async function createUsers(prisma: PrismaClient, n: number) {
  // 1) cache de existentes (por idempotencia)
  const existing = await prisma.user.findMany({ select: { email: true } });
  const existingEmails = new Set(existing.map((e) => e.email));

  // 2) pre-hash (optimiza)
  const passwordHash = await bcrypt.hash('User123!', 10);

  // 3) generar n únicos
  const data: {
    email: string;
    name: string;
    passwordHash: string;
    role: Role;
  }[] = [];
  const used = new Set<string>();

  for (let i = 0; i < n; i++) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const name = faker.person.fullName() as string;
    const base = slugify(name) || `user${i}`;
    let email: string;

    // bucle simple hasta encontrar uno libre
    do {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const suffix = faker.string.alphanumeric(6).toLowerCase() as string;
      email = `${base}.${suffix}@example.com`;
    } while (used.has(email) || existingEmails.has(email));

    used.add(email);

    data.push({
      email,
      name,
      passwordHash,
      role: Role.USER,
    });
  }

  // 4) inserta en batch
  await prisma.user.createMany({
    data,
    skipDuplicates: true, // si algo raro se repite, lo salta
  });

  // 5) (opcional) retornar los creados
  return prisma.user.findMany({
    where: { email: { in: data.map((d) => d.email) } },
  });
}
