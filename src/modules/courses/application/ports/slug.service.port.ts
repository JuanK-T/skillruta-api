export interface SlugServicePort {
  ensureUnique(base: string): Promise<string>; // genera slug único
}
