import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CourseRepositoryPort } from '../../../domain/repositories/course.repository.port';
import { CoursePolicy } from '../../../domain/services/course.policy';

@Injectable()
export class DeleteChapterUseCase {
  constructor(private readonly repo: CourseRepositoryPort) {}

  async execute(input: {
    courseId: string;
    chapterId: string;
    userId: string;
  }) {
    const course = await this.repo.findById(input.courseId);
    if (!course) throw new NotFoundException('Curso no encontrado');

    if (!CoursePolicy.canEdit(input.userId, course.authorId)) {
      throw new ForbiddenException('Solo el autor puede eliminar capítulos');
    }

    const belongs = course.chapters.some((ch) => ch.id === input.chapterId);
    if (!belongs) throw new NotFoundException('Capítulo no pertenece al curso');

    await this.repo.deleteChapter(input.chapterId);
    return { ok: true };
  }
}
