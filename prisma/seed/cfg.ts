export const cfg = {
  users: parseInt(process.env.SEED_USERS || '20', 10),
  courses: parseInt(process.env.SEED_COURSES || '8', 10),
  minChapters: parseInt(process.env.SEED_MIN_CHAPTERS || '4', 10),
  maxChapters: parseInt(process.env.SEED_MAX_CHAPTERS || '10', 10),
  seedValue: parseInt(process.env.SEED_VALUE || '42', 10),
};
