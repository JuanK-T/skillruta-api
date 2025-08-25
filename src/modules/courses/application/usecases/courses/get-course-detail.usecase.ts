import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CourseRepositoryPort } from '../../../domain/repositories/course.repository.port';
import { CoursePolicy } from '../../../domain/services/course.policy';

@Injectable()
export class GetCourseDetailUseCase {
  constructor(private readonly repo: CourseRepositoryPort) {}

  async execute(input: {
    slug: string;
    userId: string;
  }): Promise<ReturnType<CourseRepositoryPort['findBySlug']>> {
    const course = await this.repo.findBySlug(input.slug);
    if (!course) throw new NotFoundException('Curso no encontrado');

    if (
      !CoursePolicy.canViewDetails(
        course.isPublished,
        input.userId,
        course.authorId
      )
    ) {
      throw new ForbiddenException('No tiene acceso a este curso');
    }
    return course;
  }
}
