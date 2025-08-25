import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { CourseRepositoryPort } from '../domain/repositories/course.repository.port';
import { Course, Chapter } from '../domain/entities/course.entity';
import { CourseMapper } from './course.mapper';
import { CourseCategory, Prisma } from '@prisma/client';

// Interfaces para los datos de entrada
interface CreateCourseData {
  title: string;
  slug: string;
  description?: string | null;
  category: CourseCategory;
  thumbnailUrl?: string | null;
  authorId: string;
}

interface UpdateCourseData {
  title?: string;
  slug?: string;
  description?: string | null;
  category?: CourseCategory;
  thumbnailUrl?: string | null;
  totalDurationSec?: number | null;
}

interface AddChapterData {
  title: string;
  order: number;
  contentUrl?: string | null;
  durationSec?: number | null;
}

interface UpdateChapterData {
  title?: string;
  order?: number;
  contentUrl?: string | null;
  durationSec?: number | null;
}

interface ListCatalogParams {
  q?: string;
  category?: CourseCategory;
  authorId?: string;
  page: number;
  pageSize: number;
}

@Injectable()
export class CoursePrismaRepository implements CourseRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { chapters: { orderBy: { order: 'asc' } } },
    });
    return course ? CourseMapper.toDomain(course) : null;
  }

  async findBySlug(slug: string): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: { chapters: { orderBy: { order: 'asc' } } },
    });
    return course ? CourseMapper.toDomain(course) : null;
  }

  async slugExists(slug: string): Promise<boolean> {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      select: { id: true },
    });
    return !!course;
  }

  async create(data: CreateCourseData): Promise<Course> {
    const course = await this.prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description ?? null,
        category: data.category,
        thumbnailUrl: data.thumbnailUrl ?? null,
        authorId: data.authorId,
      },
      include: { chapters: true },
    });
    return CourseMapper.toDomain(course);
  }

  async update(id: string, data: UpdateCourseData): Promise<Course> {
    const course = await this.prisma.course.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        category: data.category,
        thumbnailUrl: data.thumbnailUrl,
        totalDurationSec: data.totalDurationSec,
      },
      include: { chapters: { orderBy: { order: 'asc' } } },
    });
    return CourseMapper.toDomain(course);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.course.delete({ where: { id } });
  }

  async publish(id: string, at: Date): Promise<Course> {
    const course = await this.prisma.course.update({
      where: { id },
      data: { isPublished: true, publishedAt: at },
      include: { chapters: true },
    });
    return CourseMapper.toDomain(course);
  }

  async unpublish(id: string): Promise<Course> {
    const course = await this.prisma.course.update({
      where: { id },
      data: { isPublished: false, publishedAt: null },
      include: { chapters: true },
    });
    return CourseMapper.toDomain(course);
  }

  async listCatalog(
    params: ListCatalogParams
  ): Promise<{ items: Course[]; total: number }> {
    const where: Prisma.CourseWhereInput = {
      isPublished: true,
      ...(params.category && { category: params.category }),
      ...(params.authorId && { authorId: params.authorId }),
      ...(params.q && {
        OR: [
          { title: { contains: params.q } },
          { description: { contains: params.q } },
        ],
      }),
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // Para el catálogo, creamos cursos sin chapters
    const items = rows.map(
      (row) =>
        new Course(
          row.id,
          row.title,
          row.slug,
          row.description,
          row.category,
          row.isPublished,
          row.publishedAt,
          row.thumbnailUrl,
          row.totalDurationSec,
          row.authorId,
          row.createdAt,
          row.updatedAt,
          [] // Chapters vacíos para el catálogo
        )
    );

    return { items, total };
  }

  // --- Chapters ---
  async addChapter(courseId: string, data: AddChapterData): Promise<Chapter> {
    const chapter = await this.prisma.chapter.create({
      data: {
        courseId,
        title: data.title,
        order: data.order,
        contentUrl: data.contentUrl ?? null,
        durationSec: data.durationSec ?? null,
      },
    });
    return CourseMapper.chapterToDomain(chapter);
  }

  async updateChapter(
    chapterId: string,
    data: UpdateChapterData
  ): Promise<Chapter> {
    const chapter = await this.prisma.chapter.update({
      where: { id: chapterId },
      data: {
        title: data.title,
        order: data.order,
        contentUrl: data.contentUrl,
        durationSec: data.durationSec,
      },
    });
    return CourseMapper.chapterToDomain(chapter);
  }

  async deleteChapter(chapterId: string): Promise<void> {
    await this.prisma.chapter.delete({ where: { id: chapterId } });
  }

  async reorderChapters(courseId: string, orderedIds: string[]): Promise<void> {
    // Verificar que todos los chapters pertenecen al curso
    const chaptersCount = await this.prisma.chapter.count({
      where: {
        id: { in: orderedIds },
        courseId: courseId,
      },
    });

    if (chaptersCount !== orderedIds.length) {
      throw new Error('Algunos chapters no pertenecen al curso especificado');
    }

    // Reordenar atómicamente
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.chapter.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    );
  }

  // Métodos adicionales útiles
  async countChapters(courseId: string): Promise<number> {
    return this.prisma.chapter.count({
      where: { courseId },
    });
  }

  async getNextChapterOrder(courseId: string): Promise<number> {
    const lastChapter = await this.prisma.chapter.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return lastChapter ? lastChapter.order + 1 : 1;
  }

  async updateTotalDuration(courseId: string): Promise<void> {
    const totalDuration = await this.prisma.chapter.aggregate({
      where: { courseId },
      _sum: { durationSec: true },
    });

    await this.prisma.course.update({
      where: { id: courseId },
      data: { totalDurationSec: totalDuration._sum.durationSec },
    });
  }
}
