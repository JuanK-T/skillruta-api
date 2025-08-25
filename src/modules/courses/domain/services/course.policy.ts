export class CoursePolicy {
  static canEdit(userId: string, courseAuthorId: string) {
    return userId === courseAuthorId;
  }
  static canViewDetails(
    courseIsPublished: boolean,
    userId: string,
    courseAuthorId: string
  ) {
    return courseIsPublished || userId === courseAuthorId;
  }
}
