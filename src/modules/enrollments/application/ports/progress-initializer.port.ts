export interface ProgressInitializerPort {
  // TODO: Se llama tras inscribir; puedes dejarlo NOOP por ahora
  ensureProgressRowsForEnrollment(
    userId: string,
    courseId: string
  ): Promise<void>;
}
