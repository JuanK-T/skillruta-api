import { Module } from '@nestjs/common';
import { PrismaModule } from '@/infra/prisma/prisma.module';

import { EnrollmentsController } from './enrollments.controller';

import { EnrollInCourseUseCase } from './application/usecases/enroll-in-course.usecase';
import { UnenrollFromCourseUseCase } from './application/usecases/unenroll-from-course.usecase';
import { ListMyEnrollmentsUseCase } from './application/usecases/list-my-enrollments.usecase';
import { ListCourseEnrollmentsUseCase } from './application/usecases/list-course-enrollments.usecase';

import { PrismaEnrollmentRepository } from './infrastructure/prisma-enrollment.repository';
import { PrismaCourseReadRepository } from './infrastructure/prisma-course-read.repository';
import { ProgressInitializerNoop } from './infrastructure/progress-initializer.noop';

import { EnrollmentRepositoryPort } from './application/ports/enrollment.repository.port';
import { CourseReadPort } from './application/ports/course-read.port';
import { ProgressInitializerPort } from './application/ports/progress-initializer.port';

@Module({
  imports: [PrismaModule],
  controllers: [EnrollmentsController],
  providers: [
    // Use cases
    {
      provide: EnrollInCourseUseCase,
      useFactory: (
        repo: EnrollmentRepositoryPort,
        courses: CourseReadPort,
        progress: ProgressInitializerPort
      ) => new EnrollInCourseUseCase(repo, courses, progress),
      inject: [
        'EnrollmentRepositoryPort',
        'CourseReadPort',
        'ProgressInitializerPort',
      ],
    },
    {
      provide: UnenrollFromCourseUseCase,
      useFactory: (repo: EnrollmentRepositoryPort) =>
        new UnenrollFromCourseUseCase(repo),
      inject: ['EnrollmentRepositoryPort'],
    },
    {
      provide: ListMyEnrollmentsUseCase,
      useFactory: (repo: EnrollmentRepositoryPort) =>
        new ListMyEnrollmentsUseCase(repo),
      inject: ['EnrollmentRepositoryPort'],
    },
    {
      provide: ListCourseEnrollmentsUseCase,
      useFactory: (repo: EnrollmentRepositoryPort, courses: CourseReadPort) =>
        new ListCourseEnrollmentsUseCase(repo, courses),
      inject: ['EnrollmentRepositoryPort', 'CourseReadPort'],
    },

    // Adapters bound to ports
    {
      provide: 'EnrollmentRepositoryPort',
      useClass: PrismaEnrollmentRepository,
    },
    { provide: 'CourseReadPort', useClass: PrismaCourseReadRepository },
    { provide: 'ProgressInitializerPort', useClass: ProgressInitializerNoop },
  ],
  exports: [],
})
export class EnrollmentsModule {}
