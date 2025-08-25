import { EnrollmentRepositoryPort } from '../ports/enrollment.repository.port';
import { ForbiddenException } from '@nestjs/common';
import { CourseReadPort } from '../ports/course-read.port';

export class ListCourseEnrollmentsUseCase {
  constructor(
    private readonly repo: EnrollmentRepositoryPort,
    private readonly courses: CourseReadPort
  ) {}

  async execute(params: {
    courseId: string;
    requesterId: string;
    requesterRole?: 'ADMIN' | 'USER';
    page?: number;
    pageSize?: number;
  }) {
    const authorId = await this.courses.getAuthorId(params.courseId);
    const isOwner = authorId === params.requesterId;
    const isAdmin = params.requesterRole === 'ADMIN';
    if (!isOwner && !isAdmin)
      throw new ForbiddenException(
        'Solo el autor o un admin puede ver las inscripciones de un curso'
      );

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 12;
    return this.repo.listByCourse(params.courseId, page, pageSize);
  }
}
