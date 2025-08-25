import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CourseRepositoryPort } from '../../../domain/repositories/course.repository.port';
import { CoursePolicy } from '../../../domain/services/course.policy';

@Injectable()
export class UpdateChapterUseCase {
  constructor(private readonly repo: CourseRepositoryPort) {}

  async execute(input: {
    courseId: string;
    chapterId: string;
    dto: Partial<{
      title: string;
      order: number;
      contentUrl: string | null;
      durationSec: number | null;
    }>;
    userId: string;
  }) {
    const course = await this.repo.findById(input.courseId);
    if (!course) throw new NotFoundException('Curso no encontrado');

    if (!CoursePolicy.canEdit(input.userId, course.authorId)) {
      throw new ForbiddenException('Solo el autor puede editar capítulos');
    }

    const belongs = course.chapters.some((ch) => ch.id === input.chapterId);
    if (!belongs) throw new NotFoundException('Capítulo no pertenece al curso');

    if (typeof input.dto.order === 'number' && input.dto.order < 1) {
      throw new BadRequestException('El orden debe ser >= 1');
    }

    return this.repo.updateChapter(input.chapterId, input.dto);
  }
}
