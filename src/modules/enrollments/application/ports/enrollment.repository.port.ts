import { EnrollmentEntity } from '../../domain/enrollment.entity';

export interface EnrollmentRepositoryPort {
  findByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<EnrollmentEntity | null>;
  create(userId: string, courseId: string): Promise<EnrollmentEntity>;
  deleteById(id: string, userId: string): Promise<void>;
  listByUser(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<{ items: EnrollmentEntity[]; total: number }>;
  listByCourse(
    courseId: string,
    page: number,
    pageSize: number
  ): Promise<{ items: EnrollmentEntity[]; total: number }>;
}
