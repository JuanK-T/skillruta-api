import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'; // usa tu ruta real
import { CreateCourseUseCase } from './application/usecases/courses/create-course.usecase';
import { UpdateCourseUseCase } from './application/usecases/courses/update-course.usecase';
import { UnpublishCourseUseCase } from './application/usecases/courses/unpublish-course.usecase';
import { GetCatalogUseCase } from './application/usecases/chapters/get-catalog.usecase';
import { GetCourseDetailUseCase } from './application/usecases/courses/get-course-detail.usecase';
import { AddChapterUseCase } from './application/usecases/chapters/add-chapter.usecase';
import { UpdateChapterUseCase } from './application/usecases/chapters/update-chapter.usecase';
import { DeleteChapterUseCase } from './application/usecases/chapters/delete-chapter.usecase';
import { ReorderChaptersUseCase } from './application/usecases/chapters/reorder-chapters.usecase';
import { CreateCourseDto } from './application/dto/create-course.dto';
import { UpdateCourseDto } from './application/dto/update-course.dto';
import { AddChapterDto } from './application/dto/add-chapter.dto';
import { ReorderChaptersDto } from './application/dto/reorder-chapters.dto';
import { User as UserDec } from '../../common/decorators/user.decorator';
import { PublishCourseUseCase } from './application/usecases/courses/publish-course.usecase';
import { DeleteCourseUseCase } from './application/usecases/courses/delete-course.usecase';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly createCourse: CreateCourseUseCase,
    private readonly updateCourse: UpdateCourseUseCase,
    private readonly publishCourse: PublishCourseUseCase,
    private readonly unpublishCourse: UnpublishCourseUseCase,
    private readonly getCatalog: GetCatalogUseCase,
    private readonly getDetail: GetCourseDetailUseCase,
    private readonly addChapter: AddChapterUseCase,
    private readonly updateChapter: UpdateChapterUseCase,
    private readonly deleteChapterUc: DeleteChapterUseCase,
    private readonly reorderChapters: ReorderChaptersUseCase,
    private readonly deleteCourseUseCase: DeleteCourseUseCase
  ) {}

  // --------- PÚBLICO: Catálogo (solo portada) ----------
  @Get('catalog')
  async catalog(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('authorId') authorId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('pageSize', new DefaultValuePipe(12), ParseIntPipe) pageSize = 12
  ) {
    return this.getCatalog.execute({ q, category, authorId, page, pageSize });
  }

  // --------- AUTH: Crear ----------
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateCourseDto, @UserDec('id') userId: string) {
    return this.createCourse.execute({ dto, userId });
  }

  // --------- AUTH: Detalle + chapters ----------
  // Requiere login SIEMPRE. Si no publicado, solo dueño.
  @UseGuards(JwtAuthGuard)
  @Get(':slug')
  async detail(@Param('slug') slug: string, @UserDec('id') userId: string) {
    return this.getDetail.execute({ slug, userId });
  }

  // --------- OWNER: Editar/Eliminar/Publicar ----------
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @UserDec('id') userId: string
  ) {
    return this.updateCourse.execute({ id, dto, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @UserDec('id') userId: string) {
    await this.deleteCourseUseCase.execute({ id, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  async publish(@Param('id') id: string, @UserDec('id') userId: string) {
    return this.publishCourse.execute({ id, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unpublish')
  async unpublish(@Param('id') id: string, @UserDec('id') userId: string) {
    return this.unpublishCourse.execute({ id, userId });
  }

  // --------- OWNER: Chapters ----------
  @UseGuards(JwtAuthGuard)
  @Post(':id/chapters')
  async addCh(
    @Param('id') courseId: string,
    @Body() dto: AddChapterDto,
    @UserDec('id') userId: string
  ) {
    return this.addChapter.execute({ courseId, dto, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/chapters/:chapterId')
  async updateCh(
    @Param('id') courseId: string,
    @Param('chapterId') chapterId: string,
    @Body() dto: Partial<AddChapterDto>,
    @UserDec('id') userId: string
  ) {
    return this.updateChapter.execute({ courseId, chapterId, dto, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/chapters/:chapterId')
  async deleteCh(
    @Param('id') courseId: string,
    @Param('chapterId') chapterId: string,
    @UserDec('id') userId: string
  ) {
    return this.deleteChapterUc.execute({ courseId, chapterId, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reorder')
  async reorder(
    @Param('id') courseId: string,
    @Body() dto: ReorderChaptersDto,
    @UserDec('id') userId: string
  ) {
    return this.reorderChapters.execute({
      courseId,
      orderedIds: dto.orderedIds,
      userId,
    });
  }
}
