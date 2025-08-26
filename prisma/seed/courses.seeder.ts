import { PrismaClient, CourseCategory, MediaKind } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { pick, generateUniqueSlug } from './utils';
import { slugify, uploadBufferToMinio } from './minio-utils';

function randomCategory(): CourseCategory {
  return pick(Object.values(CourseCategory));
}

function randomMediaKind(): MediaKind {
  return pick(Object.values(MediaKind));
}

// Función para generar contenido de archivo simulado
// eslint-disable-next-line @typescript-eslint/require-await
async function generateFileContent(
  kind: MediaKind,
  title: string
): Promise<{
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}> {
  const extMap = {
    [MediaKind.IMAGE]: { ext: '.jpg', mime: 'image/jpeg' },
    [MediaKind.VIDEO]: { ext: '.mp4', mime: 'video/mp4' },
    [MediaKind.AUDIO]: { ext: '.mp3', mime: 'audio/mpeg' },
    [MediaKind.DOCUMENT]: { ext: '.pdf', mime: 'application/pdf' },
    [MediaKind.OTHER]: { ext: '.bin', mime: 'application/octet-stream' },
  };

  const { ext, mime } = extMap[kind];
  const originalName = `${slugify(title)}${ext}`;

  const content = `Simulated ${kind} file for ${title}`;
  const buffer = Buffer.from(content);

  return { buffer, mimeType: mime, originalName };
}

export async function createCourseWithChapters(
  prisma: PrismaClient,
  authorId: string,
  minChapters: number,
  maxChapters: number
) {
  const title = faker.company.catchPhrase();
  const isPublished = faker.datatype.boolean({ probability: 0.7 });
  const slug = await generateUniqueSlug(prisma, title);

  // Subir thumbnail a MinIO
  let thumbnailUrl: string | null = null;
  try {
    const thumbnailContent = `Simulated thumbnail for ${title}`;
    const thumbnailBuffer = Buffer.from(thumbnailContent);
    const { url } = await uploadBufferToMinio(
      thumbnailBuffer,
      `thumbnail-${slug}.jpg`,
      'image/jpeg'
    );
    thumbnailUrl = url; // Usamos directamente la URL que devuelve uploadBufferToMinio
  } catch (error) {
    console.warn(`No se pudo subir thumbnail para ${title}:`, error);
    thumbnailUrl = `https://placehold.co/800x450/png?text=${encodeURIComponent(title)}`;
  }

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      description: faker.lorem.paragraph(),
      category: randomCategory(),
      isPublished,
      publishedAt: isPublished ? faker.date.recent({ days: 60 }) : null,
      thumbnailUrl,
      totalDurationSec: 0,
      authorId,
    },
  });

  const chaptersCount = faker.number.int({
    min: minChapters,
    max: maxChapters,
  });
  let total = 0;

  for (let order = 1; order <= chaptersCount; order++) {
    const durationSec = faker.number.int({ min: 180, max: 1200 });
    total += durationSec;
    const chapterTitle = faker.company.buzzPhrase();

    const chapter = await prisma.chapter.create({
      data: {
        courseId: course.id,
        title: chapterTitle,
        order,
        contentUrl: faker.internet.url(),
        durationSec,
      },
    });

    // Crear medios para el capítulo
    const medias = faker.number.int({ min: 0, max: 2 });
    for (let m = 0; m < medias; m++) {
      const kind = randomMediaKind();

      try {
        const { buffer, mimeType, originalName } = await generateFileContent(
          kind,
          `${chapterTitle}-${m + 1}`
        );
        const { storageKey, sizeBytes, sha256, url } =
          await uploadBufferToMinio(buffer, originalName, mimeType);

        await prisma.media.create({
          data: {
            kind,
            storageKey,
            url, // Usamos directamente la URL que devuelve uploadBufferToMinio
            mimeType,
            sizeBytes,
            sha256,
            chapterId: chapter.id,
          },
        });
      } catch (error) {
        console.warn(
          `No se pudo crear medio para capítulo ${chapterTitle}:`,
          error
        );
      }
    }
  }

  await prisma.course.update({
    where: { id: course.id },
    data: { totalDurationSec: total },
  });

  return prisma.course.findUnique({
    where: { id: course.id },
    include: { chapters: { include: { media: true } } },
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
