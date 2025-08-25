import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function createBadgesForSomeCourses(
  prisma: PrismaClient,
  courseIds: string[]
) {
  // asociadas a curso
  for (const courseId of courseIds.slice(0, Math.ceil(courseIds.length / 2))) {
    await prisma.badge.create({
      data: {
        code: `COURSE_COMPLETE_${courseId.slice(0, 8)}`,
        name: 'Curso completado',
        description: 'Otorgada al completar el curso',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        iconUrl: faker.image.urlLoremFlickr({ category: 'medal' }) as string,
        courseId,
      },
    });
  }

  // globales
  for (let i = 0; i < 3; i++) {
    await prisma.badge.create({
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        code: `GLOBAL_${i}_${faker.string.alphanumeric(6)}`, // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        name: faker.word.sample({ length: 2 }).toUpperCase() + ' Badge', // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        description: faker.lorem.sentence() as string, // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        iconUrl: faker.image.urlLoremFlickr({ category: 'badge' }) as string,
      },
    });
  }
}
