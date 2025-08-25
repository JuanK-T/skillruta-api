import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { EnrollmentRepositoryPort } from '../application/ports/enrollment.repository.port';
import { EnrollmentEntity } from '../domain/enrollment.entity';
import { Enrollment as PrismaEnrollment } from '@prisma/client';

@Injectable()
export class PrismaEnrollmentRepository implements EnrollmentRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndCourse(userId: string, courseId: string) {
    const row = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    return row ? this.map(row) : null;
  }

  async create(userId: string, courseId: string) {
    const row = await this.prisma.enrollment.create({
      data: { userId, courseId },
    });
    return this.map(row);
  }

  async deleteById(id: string, userId: string) {
    const row = await this.prisma.enrollment.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Inscripción no encontrada');
    if (row.userId !== userId)
      throw new ForbiddenException(
        'No puedes eliminar una inscripción de otro usuario'
      );

    await this.prisma.enrollment.delete({ where: { id } });
  }

  async listByUser(userId: string, page: number, pageSize: number) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.enrollment.findMany({
        where: { userId },
        orderBy: { enrolledAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.enrollment.count({ where: { userId } }),
    ]);
    return { items: items.map(this.map), total };
  }

  async listByCourse(courseId: string, page: number, pageSize: number) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.enrollment.findMany({
        where: { courseId },
        orderBy: { enrolledAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.enrollment.count({ where: { courseId } }),
    ]);
    return { items: items.map(this.map), total };
  }

  private map = (r: PrismaEnrollment): EnrollmentEntity => ({
    id: r.id,
    userId: r.userId,
    courseId: r.courseId,
    enrolledAt: r.enrolledAt,
  });
}
