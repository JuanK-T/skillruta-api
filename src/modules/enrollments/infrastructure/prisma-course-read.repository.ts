import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { CourseReadPort } from '../application/ports/course-read.port';

@Injectable()
export class PrismaCourseReadRepository implements CourseReadPort {
  constructor(private readonly prisma: PrismaService) {}

  async getAuthorId(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { authorId: true },
    });
    return course?.authorId ?? null;
  }

  async isPublished(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { isPublished: true },
    });
    return !!course?.isPublished;
  }
}
