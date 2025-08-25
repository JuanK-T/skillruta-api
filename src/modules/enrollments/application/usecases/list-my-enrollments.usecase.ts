import { EnrollmentRepositoryPort } from '../ports/enrollment.repository.port';

export class ListMyEnrollmentsUseCase {
  constructor(private readonly repo: EnrollmentRepositoryPort) {}

  execute(params: { userId: string; page?: number; pageSize?: number }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 12;
    return this.repo.listByUser(params.userId, page, pageSize);
  }
}
