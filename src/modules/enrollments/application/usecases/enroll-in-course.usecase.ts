import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentRepositoryPort } from '../ports/enrollment.repository.port';
import { CourseReadPort } from '../ports/course-read.port';
import { ProgressInitializerPort } from '../ports/progress-initializer.port';

export class EnrollInCourseUseCase {
  constructor(
    private readonly repo: EnrollmentRepositoryPort,
    private readonly courses: CourseReadPort,
    private readonly progressInit: ProgressInitializerPort
  ) {}

  async execute(params: {
    userId: string;
    courseId: string;
    userRole?: 'ADMIN' | 'USER';
  }) {
    const { userId, courseId, userRole } = params;

    const authorId = await this.courses.getAuthorId(courseId);
    if (!authorId) throw new NotFoundException('Curso no encontrado');

    // Regla: el autor NO puede inscribirse a su curso
    if (authorId === userId) {
      throw new ForbiddenException(
        'El autor del curso no puede inscribirse a su propio curso'
      );
    }

    // Regla: curso debe estar publicado para usuarios; ADMIN puede forzar
    const published = await this.courses.isPublished(courseId);
    if (!published && userRole !== 'ADMIN') {
      throw new ForbiddenException('El curso no está publicado');
    }

    const exists = await this.repo.findByUserAndCourse(userId, courseId);
    if (exists) throw new ConflictException('Ya estás inscrito en este curso');

    const created = await this.repo.create(userId, courseId);

    await this.progressInit.ensureProgressRowsForEnrollment(userId, courseId);

    return created;
  }
}
