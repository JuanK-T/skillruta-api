import { EnrollmentRepositoryPort } from '../ports/enrollment.repository.port';

export class UnenrollFromCourseUseCase {
  constructor(private readonly repo: EnrollmentRepositoryPort) {}

  async execute(params: { enrollmentId: string; userId: string }) {
    // la repo debe validar ownership (se pasa userId)
    await this.repo.deleteById(params.enrollmentId, params.userId);
  }
}
