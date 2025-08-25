import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CourseRepositoryPort } from '../../../domain/repositories/course.repository.port';
import { CoursePolicy } from '../../../domain/services/course.policy';
import { AddChapterDto } from '../../dto/add-chapter.dto';

@Injectable()
export class AddChapterUseCase {
  constructor(private readonly repo: CourseRepositoryPort) {}

  async execute(input: {
    courseId: string;
    dto: AddChapterDto;
    userId: string;
  }) {
    const course = await this.repo.findById(input.courseId);
    if (!course) throw new NotFoundException('Curso no encontrado');

    if (!CoursePolicy.canEdit(input.userId, course.authorId)) {
      throw new ForbiddenException('Solo el autor puede agregar capítulos');
    }

    const order = input.dto.order ?? (course.chapters?.length ?? 0) + 1;

    return this.repo.addChapter(course.id, {
      title: input.dto.title,
      order,
      contentUrl: input.dto.contentUrl ?? null,
      durationSec: input.dto.durationSec ?? null,
    });
  }
}
