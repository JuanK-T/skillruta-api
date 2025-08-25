import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CourseRepositoryPort } from '../../../domain/repositories/course.repository.port';
import { CoursePolicy } from '../../../domain/services/course.policy';

@Injectable()
export class DeleteCourseUseCase {
  constructor(private readonly repo: CourseRepositoryPort) {}

  async execute(input: { id: string; userId: string }) {
    const course = await this.repo.findById(input.id);
    if (!course) throw new NotFoundException('Curso no encontrado');

    if (!CoursePolicy.canEdit(input.userId, course.authorId)) {
      throw new ForbiddenException('Solo el autor puede eliminar este curso');
    }

    await this.repo.delete(course.id);
    return { ok: true };
  }
}
