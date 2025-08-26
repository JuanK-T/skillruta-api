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
        iconUrl: faker.image.urlLoremFlickr({ category: 'medal' }),
        courseId,
      },
    });
  }

  // globales
  for (let i = 0; i < 3; i++) {
    await prisma.badge.create({
      data: {
        code: `GLOBAL_${i}_${faker.string.alphanumeric(6)}`,
        name: faker.word.sample({ length: 2 }).toUpperCase() + ' Badge',
        description: faker.lorem.sentence(),
        iconUrl: faker.image.urlLoremFlickr({ category: 'badge' }),
      },
    });
  }
}
