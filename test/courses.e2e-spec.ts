import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { CoursesController } from '../src/modules/courses/courses.controller';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';

import { CreateCourseUseCase } from '../src/modules/courses/application/usecases/courses/create-course.usecase';
import { UpdateCourseUseCase } from '../src/modules/courses/application/usecases/courses/update-course.usecase';
import { PublishCourseUseCase } from '../src/modules/courses/application/usecases/courses/publish-course.usecase';
import { UnpublishCourseUseCase } from '../src/modules/courses/application/usecases/courses/unpublish-course.usecase';
import { GetCatalogUseCase } from '../src/modules/courses/application/usecases/chapters/get-catalog.usecase';
import { GetCourseDetailUseCase } from '../src/modules/courses/application/usecases/courses/get-course-detail.usecase';
import { AddChapterUseCase } from '../src/modules/courses/application/usecases/chapters/add-chapter.usecase';
import { UpdateChapterUseCase } from '../src/modules/courses/application/usecases/chapters/update-chapter.usecase';
import { DeleteChapterUseCase } from '../src/modules/courses/application/usecases/chapters/delete-chapter.usecase';
import { ReorderChaptersUseCase } from '../src/modules/courses/application/usecases/chapters/reorder-chapters.usecase';
import { DeleteCourseUseCase } from '../src/modules/courses/application/usecases/courses/delete-course.usecase';

// Helpers
type Mocked<T> = { [K in keyof T]: jest.Mock<any, any> };
function ucMock<T extends { execute: any }>(): Mocked<T> {
  return { execute: jest.fn() } as any;
}

// Guard falso que además setea req.user
class PassJwtGuard {
  canActivate(ctx: any) {
    const req = ctx.switchToHttp().getRequest();
    req.user = { id: 'user-1', email: 'user@skillruta.dev' };
    return true;
  }
}

describe('CoursesController (e2e)', () => {
  let app: INestApplication;

  let createCourse: Mocked<CreateCourseUseCase>;
  let updateCourse: Mocked<UpdateCourseUseCase>;
  let publishCourse: Mocked<PublishCourseUseCase>;
  let unpublishCourse: Mocked<UnpublishCourseUseCase>;
  let getCatalog: Mocked<GetCatalogUseCase>;
  let getDetail: Mocked<GetCourseDetailUseCase>;
  let addChapter: Mocked<AddChapterUseCase>;
  let updateChapter: Mocked<UpdateChapterUseCase>;
  let deleteChapterUc: Mocked<DeleteChapterUseCase>;
  let reorderChapters: Mocked<ReorderChaptersUseCase>;
  let deleteCourseUseCase: Mocked<DeleteCourseUseCase>;

  beforeAll(async () => {
    createCourse = ucMock();
    updateCourse = ucMock();
    publishCourse = ucMock();
    unpublishCourse = ucMock();
    getCatalog = ucMock();
    getDetail = ucMock();
    addChapter = ucMock();
    updateChapter = ucMock();
    deleteChapterUc = ucMock();
    reorderChapters = ucMock();
    deleteCourseUseCase = ucMock();

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        { provide: CreateCourseUseCase, useValue: createCourse },
        { provide: UpdateCourseUseCase, useValue: updateCourse },
        { provide: PublishCourseUseCase, useValue: publishCourse },
        { provide: UnpublishCourseUseCase, useValue: unpublishCourse },
        { provide: GetCatalogUseCase, useValue: getCatalog },
        { provide: GetCourseDetailUseCase, useValue: getDetail },
        { provide: AddChapterUseCase, useValue: addChapter },
        { provide: UpdateChapterUseCase, useValue: updateChapter },
        { provide: DeleteChapterUseCase, useValue: deleteChapterUc },
        { provide: ReorderChaptersUseCase, useValue: reorderChapters },
        { provide: DeleteCourseUseCase, useValue: deleteCourseUseCase },
      ],
    })
      // Bypass del guard y seteo de req.user
      .overrideGuard(JwtAuthGuard)
      .useClass(PassJwtGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /courses/catalog', () => {
    it('debe responder 200 y devolver el payload del use case', async () => {
      const expected = {
        items: [
          { id: 'c1', title: 'Intro NestJS', slug: 'intro-nestjs' },
          { id: 'c2', title: 'Prisma Basics', slug: 'prisma-basics' },
        ],
        total: 2,
        page: 2,
        pageSize: 24,
      };
      getCatalog.execute.mockResolvedValue(expected);

      const q = 'nestjs';
      const category = 'PROGRAMMING';
      const authorId = 'auth-1';
      const page = 2;
      const pageSize = 24;

      await request(app.getHttpServer())
        .get('/courses/catalog')
        .query({ q, category, authorId, page, pageSize })
        .expect(200)
        .expect(expected);

      expect(getCatalog.execute).toHaveBeenCalledWith({
        q,
        category,
        authorId,
        page,
        pageSize,
      });
    });
  });

  describe('POST /courses/:id/publish', () => {
    it('debe responder 201 y pasar id + userId al use case', async () => {
      const id = 'c1';
      const expected = { id, isPublished: true };
      publishCourse.execute.mockResolvedValue(expected);

      await request(app.getHttpServer())
        .post(`/courses/${id}/publish`)
        .set('Authorization', 'Bearer FAKE') // opcional; el guard ya pasa
        .expect(201)
        .expect(expected);

      expect(publishCourse.execute).toHaveBeenCalledWith({
        id,
        userId: 'user-1',
      });
    });
  });
});
