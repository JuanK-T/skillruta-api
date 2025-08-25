export class Course {
  constructor(
    public readonly id: string,
    public title: string,
    public slug: string,
    public description: string | null,
    public category: string,
    public isPublished: boolean,
    public publishedAt: Date | null,
    public thumbnailUrl: string | null,
    public totalDurationSec: number | null,
    public authorId: string,
    public createdAt: Date,
    public updatedAt: Date,
    public chapters: Chapter[] = []
  ) {}
}

export class Chapter {
  constructor(
    public readonly id: string,
    public courseId: string,
    public title: string,
    public order: number,
    public contentUrl: string | null,
    public durationSec: number | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
