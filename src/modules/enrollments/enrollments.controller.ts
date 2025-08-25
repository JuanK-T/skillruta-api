import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role, UserPayload } from '@/common/types';
import { User as UserDec } from '@/common/decorators/user.decorator';

import { EnrollInCourseUseCase } from './application/usecases/enroll-in-course.usecase';
import { UnenrollFromCourseUseCase } from './application/usecases/unenroll-from-course.usecase';
import { ListMyEnrollmentsUseCase } from './application/usecases/list-my-enrollments.usecase';
import { ListCourseEnrollmentsUseCase } from './application/usecases/list-course-enrollments.usecase';
import { EnrollCourseDto } from './application/dto/enroll-course.dto';
import { EnrollmentResponse } from './application/dto/enrollment-response.dto';

@ApiTags('enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class EnrollmentsController {
  constructor(
    private readonly enrollIn: EnrollInCourseUseCase,
    private readonly unenroll: UnenrollFromCourseUseCase,
    private readonly listMine: ListMyEnrollmentsUseCase,
    private readonly listCourse: ListCourseEnrollmentsUseCase
  ) {}

  @Post('enrollments')
  @ApiOperation({ summary: 'Inscribirse a un curso (autor NO permitido)' })
  @ApiCreatedResponse({ type: EnrollmentResponse })
  async enroll(@Body() dto: EnrollCourseDto, @UserDec() user: UserPayload) {
    const created = await this.enrollIn.execute({
      userId: user.id,
      courseId: dto.courseId,
      userRole: user.role,
    });
    return created;
  }

  @Delete('enrollments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar inscripción propia' })
  @ApiNoContentResponse()
  async unenrollMy(@Param('id') id: string, @UserDec('id') userId: string) {
    await this.unenroll.execute({ enrollmentId: id, userId });
  }

  @Get('me/enrollments')
  @ApiOperation({ summary: 'Listar mis cursos (paginado)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 12 })
  @ApiOkResponse({ description: 'Listado paginado' })
  async listMy(
    @UserDec('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('pageSize', new DefaultValuePipe(12), ParseIntPipe) pageSize = 12
  ) {
    return this.listMine.execute({ userId, page, pageSize });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER) // el guard de abajo valida owner/admin
  @Get('courses/:id/enrollments')
  @ApiParam({ name: 'id', description: 'ID del curso' })
  async listByCourse(
    @Param('id') courseId: string,
    @UserDec() user: UserPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('pageSize', new DefaultValuePipe(12), ParseIntPipe) pageSize = 12
  ) {
    return this.listCourse.execute({
      courseId,
      requesterId: user.id,
      requesterRole: user.role,
      page,
      pageSize,
    });
  }
}
