import { Course, Chapter } from '../entities/course.entity';

export interface CourseRepositoryPort {
  findById(id: string): Promise<Course | null>;
  findBySlug(slug: string): Promise<Course | null>;
  slugExists(slug: string): Promise<boolean>;

  create(data: {
    title: string;
    slug: string;
    description?: string | null;
    category: string;
    thumbnailUrl?: string | null;
    authorId: string;
  }): Promise<Course>;

  update(
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      description: string | null;
      category: string;
      thumbnailUrl: string | null;
      totalDurationSec: number | null;
    }>
  ): Promise<Course>;

  delete(id: string): Promise<void>;

  publish(id: string, at: Date): Promise<Course>;
  unpublish(id: string): Promise<Course>;

  listCatalog(params: {
    q?: string;
    category?: string;
    authorId?: string;
    page: number;
    pageSize: number;
  }): Promise<{ items: Course[]; total: number }>;

  // Chapters
  addChapter(
    courseId: string,
    data: {
      title: string;
      order: number;
      contentUrl?: string | null;
      durationSec?: number | null;
    }
  ): Promise<Chapter>;

  updateChapter(
    chapterId: string,
    data: Partial<{
      title: string;
      order: number;
      contentUrl: string | null;
      durationSec: number | null;
    }>
  ): Promise<Chapter>;

  deleteChapter(chapterId: string): Promise<void>;
  reorderChapters(courseId: string, orderedIds: string[]): Promise<void>;
}
