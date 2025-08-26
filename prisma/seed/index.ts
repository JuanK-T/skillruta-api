import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { cfg } from './cfg';
import { ensureAdmin, createUsers } from './users.seeder';
import { createCoursesBatch } from './courses.seeder';
import { enrollUsersAndGenerateProgress } from './enrollments.seeder';
import { createBadgesForSomeCourses } from './badges.seeder';
import { randomlyAwardBadgesToUsers } from './award-badges.seeder';
import { ensureBucket } from './minio-client';

const prisma = new PrismaClient();

async function main() {
  try {
    await ensureBucket();
    console.log('✅ Bucket de MinIO verificado');
  } catch (error) {
    console.error('❌ Error configurando MinIO:', error);
  }

  faker.seed(cfg.seedValue);

  console.log('🔑 Asegurando admin...');
  const admin = await ensureAdmin(prisma);

  console.log('👥 Creando usuarios...');
  const users = await createUsers(prisma, cfg.users);
  const allUsers = [admin, ...users];
  const userIds = allUsers.map((u) => u.id);

  console.log('📚 Creando cursos + capítulos...');
  const courses = await createCoursesBatch(
    prisma,
    userIds, // autores posibles
    cfg.courses,
    cfg.minChapters,
    cfg.maxChapters
  );

  console.log('📝 Matrículas + progresos...');
  for (const c of courses) {
    const chapterIds = (c?.chapters ?? []).map((ch) => ch.id);
    if (chapterIds.length) {
      await enrollUsersAndGenerateProgress(prisma, userIds, c!.id, chapterIds);
    }
  }

  console.log('🏅 Creando insignias...');
  await createBadgesForSomeCourses(
    prisma,
    courses.map((c) => c!.id)
  );

  console.log('🎁 Otorgando insignias a usuarios...');
  await randomlyAwardBadgesToUsers(prisma);

  console.log('✅ Seed terminado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch(() => {}); // Catch vacío para manejar errores
  });
