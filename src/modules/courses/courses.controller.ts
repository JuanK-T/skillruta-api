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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
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
import { User as UserDec } from '@/common/decorators/user.decorator';
import { PublishCourseUseCase } from './application/usecases/courses/publish-course.usecase';
import { DeleteCourseUseCase } from './application/usecases/courses/delete-course.usecase';
import { CourseResponse } from './application/dto/course-response.dto';
import { CatalogResponse } from './application/dto/catalog-response.dto';
import { ChapterResponse } from './application/dto/chapter-response.dto';

@ApiTags('courses')
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
  @ApiOperation({
    summary: 'Obtener catálogo de cursos',
    description:
      'Endpoint público para obtener el catálogo de cursos publicados con paginación y filtros',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description:
      'Término de búsqueda para filtrar cursos por título o descripción',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filtrar cursos por categoría',
  })
  @ApiQuery({
    name: 'authorId',
    required: false,
    description: 'Filtrar cursos por ID del autor',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página para paginación (por defecto: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Tamaño de página para paginación (por defecto: 12)',
    example: 12,
  })
  @ApiOkResponse({
    description: 'Catálogo de cursos obtenido exitosamente',
    type: CatalogResponse,
  })
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear un nuevo curso',
    description: 'Crear un nuevo curso. Requiere autenticación JWT',
  })
  @ApiBody({ type: CreateCourseDto })
  @ApiCreatedResponse({
    description: 'Curso creado exitosamente',
    type: CourseResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado - Token inválido o no proporcionado',
  })
  @ApiForbiddenResponse({
    description: 'Prohibido - El usuario no tiene permisos',
  })
  @ApiConflictResponse({ description: 'Conflicto - El curso ya existe' })
  async create(@Body() dto: CreateCourseDto, @UserDec('id') userId: string) {
    return this.createCourse.execute({ dto, userId });
  }

  // --------- AUTH: Detalle + chapters ----------
  @UseGuards(JwtAuthGuard)
  @Get(':slug')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener detalle completo de un curso',
    description:
      'Obtiene el detalle completo de un curso incluyendo chapters. Si no está publicado, solo el dueño puede verlo',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único del curso',
    example: 'introduccion-a-nestjs',
  })
  @ApiOkResponse({
    description: 'Detalle del curso obtenido exitosamente',
    type: CourseResponse,
  })
  @ApiNotFoundResponse({ description: 'Curso no encontrado' })
  @ApiForbiddenResponse({
    description: 'Prohibido - No tienes permisos para ver este curso',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado - Token inválido o no proporcionado',
  })
  async detail(@Param('slug') slug: string, @UserDec('id') userId: string) {
    return this.getDetail.execute({ slug, userId });
  }

  // --------- OWNER: Editar/Eliminar/Publicar ----------
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar un curso',
    description:
      'Actualizar la información de un curso existente. Solo el dueño puede actualizarlo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso a actualizar',
    example: 'uuid-del-curso',
  })
  @ApiBody({ type: UpdateCourseDto })
  @ApiOkResponse({
    description: 'Curso actualizado exitosamente',
    type: CourseResponse,
  })
  @ApiNotFoundResponse({ description: 'Curso no encontrado' })
  @ApiForbiddenResponse({
    description: 'Prohibido - No eres el dueño del curso',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado - Token inválido o no proporcionado',
  })
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar un curso',
    description:
      'Eliminar un curso permanentemente. Solo el dueño puede eliminarlo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso a eliminar',
    example: 'uuid-del-curso',
  })
  @ApiNoContentResponse({ description: 'Curso eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Curso no encontrado' })
  @ApiForbiddenResponse({
    description: 'Prohibido - No eres el dueño del curso',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado - Token inválido o no proporcionado',
  })
  async remove(@Param('id') id: string, @UserDec('id') userId: string) {
    await this.deleteCourseUseCase.execute({ id, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Publicar un curso',
    description:
      'Publicar un curso para que sea visible en el catálogo público. Solo el dueño puede publicarlo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso a publicar',
    example: 'uuid-del-curso',
  })
  @ApiOkResponse({
    description: 'Curso publicado exitosamente',
    type: CourseResponse,
  })
  @ApiNotFoundResponse({ description: 'Curso no encontrado' })
  @ApiForbiddenResponse({
    description: 'Prohibido - No eres el dueño del curso',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado - Token inválido o no proporcionado',
  })
  async publish(@Param('id') id: string, @UserDec('id') userId: string) {
    return this.publishCourse.execute({ id, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unpublish')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Despublicar un curso',
    description:
      'Despublicar un curso para que no sea visible en el catálogo público. Solo el dueño puede despublicarlo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso a despublicar',
    example: 'uuid-del-curso',
  })
  @ApiOkResponse({
    description: 'Curso despublicado exitosamente',
    type: CourseResponse,
  })
  @ApiNotFoundResponse({ description: 'Curso no encontrado' })
  @ApiForbiddenResponse({
    description: 'Prohibido - No eres el dueño del curso',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado - Token inválido o no proporcionado',
  })
  async unpublish(@Param('id') id: string, @UserDec('id') userId: string) {
    return this.unpublishCourse.execute({ id, userId });
  }

  // --------- OWNER: Chapters ----------
  @UseGuards(JwtAuthGuard)
  @Post(':id/chapters')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Agregar un chapter a un curso',
    description:
      'Agregar un nuevo chapter a un curso existente. Solo el dueño puede agregar chapters',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso al que se agregará el chapter',
    example: 'uuid-del-curso',
  })
  @ApiBody({ type: AddChapterDto })
  @ApiCreatedResponse({
    description: 'Chapter agregado exitosamente',
    type: ChapterResponse,
  })
  @ApiNotFoundResponse({ description: 'Curso no encontrado' })
  @ApiForbiddenResponse({
    description: 'Prohibido - No eres el dueño del curso',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado - Token inválido o no proporcionado',
  })
  async addCh(
    @Param('id') courseId: string,
    @Body() dto: AddChapterDto,
    @UserDec('id') userId: string
  ) {
    return this.addChapter.execute({ courseId, dto, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/chapters/:chapterId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar un chapter',
    description:
      'Actualizar la información de un chapter existente. Solo el dueño puede actualizarlo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso al que pertenece el chapter',
    example: 'uuid-del-curso',
  })
  @ApiParam({
    name: 'chapterId',
    description: 'ID del chapter a actualizar',
    example: 'uuid-del-chapter',
  })
  @ApiBody({ type: AddChapterDto })
  @ApiOkResponse({
    description: 'Chapter actualizado exitosamente',
    type: ChapterResponse,
  })
  @ApiNotFoundResponse({ description: 'Curso o chapter no encontrado' })
  @ApiForbiddenResponse({
    description: 'Prohibido - No eres el dueño del curso',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado - Token inválido o no proporcionado',
  })
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar un chapter',
    description:
      'Eliminar un chapter de un curso. Solo el dueño puede eliminarlo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso al que pertenece el chapter',
    example: 'uuid-del-curso',
  })
  @ApiParam({
    name: 'chapterId',
    description: 'ID del chapter a eliminar',
    example: 'uuid-del-chapter',
  })
  @ApiNoContentResponse({ description: 'Chapter eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Curso o chapter no encontrado' })
  @ApiForbiddenResponse({
    description: 'Prohibido - No eres el dueño del curso',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado - Token inválido o no proporcionado',
  })
  async deleteCh(
    @Param('id') courseId: string,
    @Param('chapterId') chapterId: string,
    @UserDec('id') userId: string
  ) {
    return this.deleteChapterUc.execute({ courseId, chapterId, userId });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reorder')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reordenar chapters',
    description:
      'Reordenar el orden de los chapters en un curso. Solo el dueño puede reordenarlos',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso cuyos chapters se reordenarán',
    example: 'uuid-del-curso',
  })
  @ApiBody({ type: ReorderChaptersDto })
  @ApiOkResponse({
    description: 'Chapters reordenados exitosamente',
    type: [ChapterResponse],
  })
  @ApiNotFoundResponse({ description: 'Curso no encontrado' })
  @ApiForbiddenResponse({
    description: 'Prohibido - No eres el dueño del curso',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado - Token inválido o no proporcionado',
  })
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
