import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME ?? 'SkillRuta API',
  port: parseInt(process.env.APP_PORT ?? '3000', 10),
  env: process.env.NODE_ENV ?? 'development',
  jwtSecret: process.env.JWT_SECRET ?? 'default-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  cookiesSecure: (process.env.COOKIE_SECURE ?? 'false') === 'true',
}));
