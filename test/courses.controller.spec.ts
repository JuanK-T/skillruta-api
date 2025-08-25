import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from '@/modules/courses/courses.controller';

import { CreateCourseUseCase } from '@/modules/courses/application/usecases/courses/create-course.usecase';
import { UpdateCourseUseCase } from '@/modules/courses/application/usecases/courses/update-course.usecase';
import { PublishCourseUseCase } from '@/modules/courses/application/usecases/courses/publish-course.usecase';
import { UnpublishCourseUseCase } from '@/modules/courses/application/usecases/courses/unpublish-course.usecase';
import { GetCatalogUseCase } from '@/modules/courses/application/usecases/chapters/get-catalog.usecase';
import { GetCourseDetailUseCase } from '@/modules/courses/application/usecases/courses/get-course-detail.usecase';
import { AddChapterUseCase } from '@/modules/courses/application/usecases/chapters/add-chapter.usecase';
import { UpdateChapterUseCase } from '@/modules/courses/application/usecases/chapters/update-chapter.usecase';
import { DeleteChapterUseCase } from '@/modules/courses/application/usecases/chapters/delete-chapter.usecase';
import { ReorderChaptersUseCase } from '@/modules/courses/application/usecases/chapters/reorder-chapters.usecase';
import { DeleteCourseUseCase } from '@/modules/courses/application/usecases/courses/delete-course.usecase';

// Helpers
type Mocked<T> = { [K in keyof T]: jest.Mock<any, any> };

function createUseCaseMock<T extends { execute: any }>(): Mocked<T> {
  return { execute: jest.fn() } as any;
}

describe('CoursesController', () => {
  let controller: CoursesController;

  // Mocks de todos los use cases
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

  beforeEach(async () => {
    createCourse = createUseCaseMock();
    updateCourse = createUseCaseMock();
    publishCourse = createUseCaseMock();
    unpublishCourse = createUseCaseMock();
    getCatalog = createUseCaseMock();
    getDetail = createUseCaseMock();
    addChapter = createUseCaseMock();
    updateChapter = createUseCaseMock();
    deleteChapterUc = createUseCaseMock();
    reorderChapters = createUseCaseMock();
    deleteCourseUseCase = createUseCaseMock();

    const module: TestingModule = await Test.createTestingModule({
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
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
  });

  // ---------- Catálogo (público) ----------
  it('catalog: debe delegar en GetCatalogUseCase con filtros y paginación', async () => {
    const expected = { items: [], total: 0, page: 1, pageSize: 12 };
    getCatalog.execute.mockResolvedValue(expected);

    const q = 'nestjs';
    const category = 'PROGRAMMING';
    const authorId = 'auth-1';
    const page = 2;
    const pageSize = 24;

    const result = await controller.catalog(
      q,
      category,
      authorId,
      page,
      pageSize
    );

    expect(getCatalog.execute).toHaveBeenCalledWith({
      q,
      category,
      authorId,
      page,
      pageSize,
    });
    expect(result).toBe(expected);
  });

  it('catalog: debe usar valores por defecto si no se envían filtros', async () => {
    const expected = { items: [], total: 0, page: 1, pageSize: 12 };
    getCatalog.execute.mockResolvedValue(expected);

    const result = await controller.catalog(
      undefined,
      undefined,
      undefined,
      1,
      12
    );

    expect(getCatalog.execute).toHaveBeenCalledWith({
      q: undefined,
      category: undefined,
      authorId: undefined,
      page: 1,
      pageSize: 12,
    });
    expect(result).toBe(expected);
  });

  // ---------- Crear ----------
  it('create: debe delegar en CreateCourseUseCase con dto y userId', async () => {
    const dto = {
      title: 'Curso',
      slug: 'curso',
      category: 'PROGRAMMING',
    } as any;
    const userId = 'user-1';
    const expected = { id: 'c1', ...dto };
    createCourse.execute.mockResolvedValue(expected);

    const result = await controller.create(dto, userId);

    expect(createCourse.execute).toHaveBeenCalledWith({ dto, userId });
    expect(result).toBe(expected);
  });

  // ---------- Detalle ----------
  it('detail: debe delegar en GetCourseDetailUseCase con slug y userId', async () => {
    const slug = 'introduccion-a-nestjs';
    const userId = 'user-1';
    const expected = { id: 'c1', slug, chapters: [] };
    getDetail.execute.mockResolvedValue(expected);

    const result = await controller.detail(slug, userId);

    expect(getDetail.execute).toHaveBeenCalledWith({ slug, userId });
    expect(result).toBe(expected);
  });

  // ---------- Update ----------
  it('update: debe delegar en UpdateCourseUseCase con id, dto y userId', async () => {
    const id = 'c1';
    const dto = { title: 'Nuevo título' } as any;
    const userId = 'user-1';
    const expected = { id, ...dto };
    updateCourse.execute.mockResolvedValue(expected);

    const result = await controller.update(id, dto, userId);

    expect(updateCourse.execute).toHaveBeenCalledWith({ id, dto, userId });
    expect(result).toBe(expected);
  });

  // ---------- Delete ----------
  it('remove: debe delegar en DeleteCourseUseCase con id y userId', async () => {
    const id = 'c1';
    const userId = 'user-1';
    deleteCourseUseCase.execute.mockResolvedValue(undefined);

    await expect(controller.remove(id, userId)).resolves.toBeUndefined();
    expect(deleteCourseUseCase.execute).toHaveBeenCalledWith({ id, userId });
  });

  // ---------- Publish / Unpublish ----------
  it('publish: debe delegar en PublishCourseUseCase con id y userId', async () => {
    const id = 'c1';
    const userId = 'user-1';
    const expected = { id, isPublished: true };
    publishCourse.execute.mockResolvedValue(expected);

    const result = await controller.publish(id, userId);

    expect(publishCourse.execute).toHaveBeenCalledWith({ id, userId });
    expect(result).toBe(expected);
  });

  it('unpublish: debe delegar en UnpublishCourseUseCase con id y userId', async () => {
    const id = 'c1';
    const userId = 'user-1';
    const expected = { id, isPublished: false };
    unpublishCourse.execute.mockResolvedValue(expected);

    const result = await controller.unpublish(id, userId);

    expect(unpublishCourse.execute).toHaveBeenCalledWith({ id, userId });
    expect(result).toBe(expected);
  });

  // ---------- Chapters ----------
  it('addCh: debe delegar en AddChapterUseCase con courseId, dto y userId', async () => {
    const courseId = 'c1';
    const dto = { title: 'Cap 1', durationSec: 120 } as any;
    const userId = 'user-1';
    const expected = { id: 'ch1', ...dto };
    addChapter.execute.mockResolvedValue(expected);

    const result = await controller.addCh(courseId, dto, userId);

    expect(addChapter.execute).toHaveBeenCalledWith({ courseId, dto, userId });
    expect(result).toBe(expected);
  });

  it('updateCh: debe delegar en UpdateChapterUseCase con courseId, chapterId, dto y userId', async () => {
    const courseId = 'c1';
    const chapterId = 'ch1';
    const dto = { title: 'Cap 1 edit' } as any;
    const userId = 'user-1';
    const expected = { id: chapterId, ...dto };
    updateChapter.execute.mockResolvedValue(expected);

    const result = await controller.updateCh(courseId, chapterId, dto, userId);

    expect(updateChapter.execute).toHaveBeenCalledWith({
      courseId,
      chapterId,
      dto,
      userId,
    });
    expect(result).toBe(expected);
  });

  it('deleteCh: debe delegar en DeleteChapterUseCase con courseId, chapterId y userId', async () => {
    const courseId = 'c1';
    const chapterId = 'ch1';
    const userId = 'user-1';
    deleteChapterUc.execute.mockResolvedValue(undefined);

    const result = await controller.deleteCh(courseId, chapterId, userId);

    expect(deleteChapterUc.execute).toHaveBeenCalledWith({
      courseId,
      chapterId,
      userId,
    });
    expect(result).toBeUndefined();
  });

  it('reorder: debe delegar en ReorderChaptersUseCase con courseId, orderedIds y userId', async () => {
    const courseId = 'c1';
    const dto = { orderedIds: ['ch2', 'ch1', 'ch3'] };
    const userId = 'user-1';
    const expected = [{ id: 'ch2' }, { id: 'ch1' }, { id: 'ch3' }];
    reorderChapters.execute.mockResolvedValue(expected);

    const result = await controller.reorder(courseId, dto as any, userId);

    expect(reorderChapters.execute).toHaveBeenCalledWith({
      courseId,
      orderedIds: dto.orderedIds,
      userId,
    });
    expect(result).toBe(expected);
  });
});
