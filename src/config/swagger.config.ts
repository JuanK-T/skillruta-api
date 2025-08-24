import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('SkillRuta API')
    .setDescription('API para cursos, capítulos, progreso e insignias')
    .setVersion('1.0.0')
    // Describe auth por cookie (JWT en httpOnly)
    .addCookieAuth('skillruta_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
