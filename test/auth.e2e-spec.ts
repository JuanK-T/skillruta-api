import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('Auth E2E', () => {
  let app: INestApplication;
  let httpServer: any;
  let agent: request.Agent;

  const prisma = new PrismaClient();
  const email = 'e2e_admin@skillruta.dev';
  const password = 'Admin123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    httpServer = app.getHttpServer();
    agent = request.agent(httpServer);

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.upsert({
      where: { email },
      update: { passwordHash: hash, role: 'ADMIN' },
      create: { email, passwordHash: hash, role: 'ADMIN' },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } }).catch(() => {});
    await prisma.$disconnect();
    await app.close();
  });

  it('login -> debe setear cookies sr_at y sr_rt', async () => {
    const res = await agent
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    const setCookieHeader = res.headers['set-cookie'];
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : setCookieHeader
        ? [setCookieHeader]
        : [];

    expect(cookies.length).toBeGreaterThan(0);
    expect(cookies.some((c) => c.startsWith('sr_at='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('sr_rt='))).toBe(true);
  });

  it('me -> 200 con perfil usando cookies', async () => {
    const res = await agent.get('/auth/me').expect(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(email);
    expect(['ADMIN', 'USER']).toContain(res.body.role);
  });

  it('refresh -> rota tokens y setea nuevas cookies', async () => {
    const res = await agent.post('/auth/refresh').expect(200);

    const setCookieHeader = res.headers['set-cookie'];
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : setCookieHeader
        ? [setCookieHeader]
        : [];

    expect(cookies.length).toBeGreaterThan(0);
    expect(cookies.some((c) => c.startsWith('sr_at='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('sr_rt='))).toBe(true);
  });

  it('logout -> limpia cookies', async () => {
    const res = await agent.post('/auth/logout').expect(200);

    const setCookieHeader = res.headers['set-cookie'];
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : setCookieHeader
        ? [setCookieHeader]
        : [];

    expect(cookies.some((c) => c.startsWith('sr_at='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('sr_rt='))).toBe(true);
  });

  it('me después de logout -> 401', async () => {
    await agent.get('/auth/me').expect(401);
  });

  // --- negativos ---
  it('login con password incorrecto -> 401', async () => {
    await request(httpServer)
      .post('/auth/login')
      .send({ email, password: 'WrongPass!' })
      .expect(401);
  });

  it('refresh sin cookie -> 401', async () => {
    await request(httpServer).post('/auth/refresh').expect(401);
  });

  it('refresh con sr_rt inválida -> 401', async () => {
    await request(httpServer)
      .post('/auth/refresh')
      .set('Cookie', ['sr_rt=not-a-valid-jwt'])
      .expect(401);
  });
});
