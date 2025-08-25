import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';

// Prisma (infra común del proyecto)
import { PrismaService } from '../../infra/prisma/prisma.service';

// Repo implementation (infra específica del módulo)
import { CoursePrismaRepository } from './infrastructure/course.prisma.repository';

// Services (infra del módulo)
import { SlugService } from './infrastructure/slug.service';

// ==== TOKENS DE PUERTOS ====
export const COURSE_REPO = 'CourseRepositoryPort';
export const SLUG_SERVICE = 'SlugServicePort';

// ==== USE CASES ====
// Courses
import { CreateCourseUseCase } from './application/usecases/courses/create-course.usecase';
import { UpdateCourseUseCase } from './application/usecases/courses/update-course.usecase';
import { PublishCourseUseCase } from './application/usecases/courses/publish-course.usecase';
import { UnpublishCourseUseCase } from './application/usecases/courses/unpublish-course.usecase';
import { GetCourseDetailUseCase } from './application/usecases/courses/get-course-detail.usecase';
import { DeleteCourseUseCase } from './application/usecases/courses/delete-course.usecase';

// Catalog
import { GetCatalogUseCase } from './application/usecases/chapters/get-catalog.usecase';

// Chapters
import { AddChapterUseCase } from './application/usecases/chapters/add-chapter.usecase';
import { UpdateChapterUseCase } from './application/usecases/chapters/update-chapter.usecase';
import { DeleteChapterUseCase } from './application/usecases/chapters/delete-chapter.usecase';
import { ReorderChaptersUseCase } from './application/usecases/chapters/reorder-chapters.usecase';

// Tipos del puerto para tipar factories
import { CourseRepositoryPort } from './domain/repositories/course.repository.port';

@Module({
  controllers: [CoursesController],
  providers: [
    // Infra compartida
    PrismaService,

    // Puerto del repositorio -> implementación Prisma
    { provide: COURSE_REPO, useClass: CoursePrismaRepository },

    // SlugService depende del puerto CourseRepositoryPort
    {
      provide: SLUG_SERVICE,
      useFactory: (repo: CourseRepositoryPort) => new SlugService(repo),
      inject: [COURSE_REPO],
    },

    // ===== Use cases (inyectan puertos por token) =====

    // Courses
    {
      provide: CreateCourseUseCase,
      useFactory: (repo: CourseRepositoryPort, slugSvc: SlugService) =>
        new CreateCourseUseCase(repo, slugSvc),
      inject: [COURSE_REPO, SLUG_SERVICE],
    },
    {
      provide: UpdateCourseUseCase,
      useFactory: (repo: CourseRepositoryPort) => new UpdateCourseUseCase(repo),
      inject: [COURSE_REPO],
    },
    {
      provide: PublishCourseUseCase,
      useFactory: (repo: CourseRepositoryPort) =>
        new PublishCourseUseCase(repo),
      inject: [COURSE_REPO],
    },
    {
      provide: UnpublishCourseUseCase,
      useFactory: (repo: CourseRepositoryPort) =>
        new UnpublishCourseUseCase(repo),
      inject: [COURSE_REPO],
    },
    {
      provide: GetCourseDetailUseCase,
      useFactory: (repo: CourseRepositoryPort) =>
        new GetCourseDetailUseCase(repo),
      inject: [COURSE_REPO],
    },
    {
      provide: DeleteCourseUseCase,
      useFactory: (repo: CourseRepositoryPort) => new DeleteCourseUseCase(repo),
      inject: [COURSE_REPO],
    },

    // Catalog
    {
      provide: GetCatalogUseCase,
      useFactory: (repo: CourseRepositoryPort) => new GetCatalogUseCase(repo),
      inject: [COURSE_REPO],
    },

    // Chapters
    {
      provide: AddChapterUseCase,
      useFactory: (repo: CourseRepositoryPort) => new AddChapterUseCase(repo),
      inject: [COURSE_REPO],
    },
    {
      provide: UpdateChapterUseCase,
      useFactory: (repo: CourseRepositoryPort) =>
        new UpdateChapterUseCase(repo),
      inject: [COURSE_REPO],
    },
    {
      provide: DeleteChapterUseCase,
      useFactory: (repo: CourseRepositoryPort) =>
        new DeleteChapterUseCase(repo),
      inject: [COURSE_REPO],
    },
    {
      provide: ReorderChaptersUseCase,
      useFactory: (repo: CourseRepositoryPort) =>
        new ReorderChaptersUseCase(repo),
      inject: [COURSE_REPO],
    },
  ],
  // exports: [] // Exporta use cases si otros módulos los necesitan
})
export class CoursesModule {}
