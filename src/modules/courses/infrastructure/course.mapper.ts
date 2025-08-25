import { Prisma } from '@prisma/client';
import { Course, Chapter } from '../domain/entities/course.entity';

type CourseWithChapters = Prisma.CourseGetPayload<{
  include: { chapters: true };
}>;

export class CourseMapper {
  static toDomain(prismaCourse: CourseWithChapters): Course {
    return new Course(
      prismaCourse.id,
      prismaCourse.title,
      prismaCourse.slug,
      prismaCourse.description,
      prismaCourse.category,
      prismaCourse.isPublished,
      prismaCourse.publishedAt,
      prismaCourse.thumbnailUrl,
      prismaCourse.totalDurationSec,
      prismaCourse.authorId,
      prismaCourse.createdAt,
      prismaCourse.updatedAt,
      prismaCourse.chapters.map((chapter) => this.chapterToDomain(chapter))
    );
  }

  static chapterToDomain(
    prismaChapter: Prisma.ChapterGetPayload<object>
  ): Chapter {
    return new Chapter(
      prismaChapter.id,
      prismaChapter.courseId,
      prismaChapter.title,
      prismaChapter.order,
      prismaChapter.contentUrl,
      prismaChapter.durationSec,
      prismaChapter.createdAt,
      prismaChapter.updatedAt
    );
  }
}
