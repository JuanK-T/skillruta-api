import { Injectable } from '@nestjs/common';
import { CourseRepositoryPort } from '../../../domain/repositories/course.repository.port';
import { SlugServicePort } from '../../ports/slug.service.port';
import { CreateCourseDto } from '../../dto/create-course.dto';
import { Course } from '../../../domain/entities/course.entity';

@Injectable()
export class CreateCourseUseCase {
  constructor(
    private readonly repo: CourseRepositoryPort,
    private readonly slugService: SlugServicePort
  ) {}

  async execute(input: {
    dto: CreateCourseDto;
    userId: string;
  }): Promise<Course> {
    const { dto, userId } = input;
    // cualquiera autenticado puede crear (guardia de JWT está en controller)
    const base = dto.title;
    const slug = await this.slugService.ensureUnique(base);
    return this.repo.create({
      title: dto.title,
      slug,
      description: dto.description ?? null,
      category: dto.category,
      thumbnailUrl: dto.thumbnailUrl ?? null,
      authorId: userId,
    });
  }
}
