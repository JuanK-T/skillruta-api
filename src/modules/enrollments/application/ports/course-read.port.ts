export interface CourseReadPort {
  getAuthorId(courseId: string): Promise<string | null>;
  isPublished(courseId: string): Promise<boolean>;
}
