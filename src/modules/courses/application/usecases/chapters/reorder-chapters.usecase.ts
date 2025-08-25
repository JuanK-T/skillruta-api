import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CourseRepositoryPort } from '../../../domain/repositories/course.repository.port';
import { CoursePolicy } from '../../../domain/services/course.policy';

@Injectable()
export class ReorderChaptersUseCase {
  constructor(private readonly repo: CourseRepositoryPort) {}

  async execute(input: {
    courseId: string;
    orderedIds: string[];
    userId: string;
  }) {
    const course = await this.repo.findById(input.courseId);
    if (!course) throw new NotFoundException('Curso no encontrado');

    if (!CoursePolicy.canEdit(input.userId, course.authorId)) {
      throw new ForbiddenException('Solo el autor puede reordenar capítulos');
    }

    const currentIds = (course.chapters ?? []).map((c) => c.id);

    if (currentIds.length !== input.orderedIds.length) {
      throw new BadRequestException(
        'La lista de IDs no coincide con los capítulos del curso'
      );
    }

    const sameSet =
      currentIds.every((id) => input.orderedIds.includes(id)) &&
      input.orderedIds.every((id) => currentIds.includes(id));

    if (!sameSet) {
      throw new BadRequestException(
        'Los IDs proporcionados no coinciden con los capítulos del curso'
      );
    }

    await this.repo.reorderChapters(course.id, input.orderedIds);
    return { ok: true };
  }
}
