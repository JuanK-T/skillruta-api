import { PrismaClient, CourseCategory, MediaKind } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { pick, generateUniqueSlug } from './utils';

function randomCategory(): CourseCategory {
  return pick(Object.values(CourseCategory));
}
function randomMediaKind(): MediaKind {
  return pick(Object.values(MediaKind));
}

export async function createCourseWithChapters(
  prisma: PrismaClient,
  authorId: string,
  minChapters: number,
  maxChapters: number
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const title = faker.company.catchPhrase() as string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const isPublished = faker.datatype.boolean({ probability: 0.7 }) as boolean;

  // 👇 aquí garantizamos que no exista en DB
  const slug = await generateUniqueSlug(prisma, title);

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      description: faker.lorem.paragraph() as string,
      category: randomCategory(),
      isPublished,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      publishedAt: isPublished // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ? faker.date.recent({ days: 60 })
        : null,
      thumbnailUrl: `https://placehold.co/800x450/png?text=${encodeURIComponent(title)}`,
      totalDurationSec: 0,
      authorId,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const chaptersCount = faker.number.int({
    min: minChapters,
    max: maxChapters,
  }) as number;
  let total = 0;

  for (let order = 1; order <= chaptersCount; order++) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const durationSec = faker.number.int({ min: 180, max: 1200 }) as number;
    total += durationSec;

    const chapter = await prisma.chapter.create({
      data: {
        courseId: course.id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        title: faker.company.buzzPhrase() as string,
        order,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        contentUrl: faker.internet.url() as string,
        durationSec,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const medias = faker.number.int({ min: 0, max: 2 }) as number;
    for (let m = 0; m < medias; m++) {
      await prisma.media.create({
        data: {
          kind: randomMediaKind(), // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          storageKey: `${course.slug}/chapter-${order}/${faker.string.uuid()}`,
          url: `https://placehold.co/1200x675/jpg?text=${encodeURIComponent(course.slug)}`,
          mimeType: pick([
            'image/png',
            'image/jpeg',
            'video/mp4',
            'application/pdf',
          ]),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          sizeBytes: faker.number.int({
            min: 5_000,
            max: 50_000_000,
          }) as number,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          sha256: faker.string.hexadecimal({
            length: 64,
            casing: 'lower',
          }) as string,
          chapterId: chapter.id,
        },
      });
    }
  }

  await prisma.course.update({
    where: { id: course.id },
    data: { totalDurationSec: total },
  });

  return prisma.course.findUnique({
    where: { id: course.id },
    include: { chapters: true },
  });
}

export async function createCoursesBatch(
  prisma: PrismaClient,
  authors: string[],
  totalCourses: number,
  minChapters: number,
  maxChapters: number
) {
  const created: Awaited<ReturnType<typeof createCourseWithChapters>>[] = [];
  for (let i = 0; i < totalCourses; i++) {
    const authorId = pick(authors);
    created.push(
      await createCourseWithChapters(prisma, authorId, minChapters, maxChapters)
    );
  }
  return created;
}
