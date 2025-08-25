import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CourseRepositoryPort } from '../../../domain/repositories/course.repository.port';
import { UpdateCourseDto } from '../../dto/update-course.dto';
import { CoursePolicy } from '../../../domain/services/course.policy';
import { Slug } from '../../../domain/objects/slug.vo';

@Injectable()
export class UpdateCourseUseCase {
  constructor(private readonly repo: CourseRepositoryPort) {}

  async execute(input: { id: string; dto: UpdateCourseDto; userId: string }) {
    const course = await this.repo.findById(input.id);
    if (!course) throw new NotFoundException('Curso no encontrado');
    if (!CoursePolicy.canEdit(input.userId, course.authorId)) {
      throw new ForbiddenException('Solo el autor puede editar este curso');
    }
    const changes: Partial<UpdateCourseDto & { slug?: string }> = {
      ...input.dto,
    };
    // si cambia el título, opcionalmente re-sluggear (o mantener slug fijo)
    if (input.dto.title && input.dto.title !== course.title) {
      changes.slug = Slug.fromTitle(input.dto.title);
    }
    return this.repo.update(course.id, changes);
  }
}
