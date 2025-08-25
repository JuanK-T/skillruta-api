import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CourseRepositoryPort } from '../../../domain/repositories/course.repository.port';
import { CoursePolicy } from '../../../domain/services/course.policy';

@Injectable()
export class UnpublishCourseUseCase {
  constructor(private readonly repo: CourseRepositoryPort) {}

  async execute(input: { id: string; userId: string }) {
    const c = await this.repo.findById(input.id);
    if (!c) throw new NotFoundException('Curso no encontrado');
    if (!CoursePolicy.canEdit(input.userId, c.authorId)) {
      throw new ForbiddenException('Solo el autor puede publicar');
    }
    return this.repo.unpublish(c.id);
  }
}
