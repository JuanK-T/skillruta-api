import { Injectable } from '@nestjs/common';
import { CourseRepositoryPort } from '../../../domain/repositories/course.repository.port';

@Injectable()
export class GetCatalogUseCase {
  constructor(private readonly repo: CourseRepositoryPort) {}

  async execute(input: {
    q?: string;
    category?: string;
    authorId?: string;
    page: number;
    pageSize: number;
  }) {
    return this.repo.listCatalog(input);
  }
}
