import { Injectable } from '@nestjs/common';
import { SlugServicePort } from '../application/ports/slug.service.port';
import { Slug } from '../domain/objects/slug.vo';
import { CourseRepositoryPort } from '../domain/repositories/course.repository.port';

@Injectable()
export class SlugService implements SlugServicePort {
  constructor(private readonly repo: CourseRepositoryPort) {}
  async ensureUnique(base: string): Promise<string> {
    const root = Slug.fromTitle(base) || 'curso';
    let attempt = 0;
    let candidate = root;
    while (await this.repo.slugExists(candidate)) {
      attempt++;
      candidate = `${root}-${attempt}`;
    }
    return candidate;
  }
}
