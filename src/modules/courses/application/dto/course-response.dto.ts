import { ApiProperty } from '@nestjs/swagger';
import { ChapterResponse } from './chapter-response.dto';

export class CourseResponse {
  @ApiProperty({ description: 'ID único del curso', example: 'uuid-v4' })
  id!: string;

  @ApiProperty({
    description: 'Título del curso',
    example: 'Introducción a NestJS',
  })
  title!: string;

  @ApiProperty({
    description: 'Slug único del curso',
    example: 'introduccion-a-nestjs',
  })
  slug!: string;

  @ApiProperty({
    description: 'Descripción del curso',
    example: 'Aprende los fundamentos de NestJS desde cero',
  })
  description!: string;

  @ApiProperty({
    description: 'URL de la imagen de portada',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({ description: 'Categoría del curso', example: 'programming' })
  category!: string;

  @ApiProperty({
    description: 'Indica si el curso está publicado',
    example: true,
  })
  isPublished?: boolean;

  @ApiProperty({ description: 'ID del autor del curso', example: 'user-uuid' })
  authorId?: string;

  @ApiProperty({ description: 'Nombre del autor', example: 'Juan Pérez' })
  authorName?: string;

  @ApiProperty({
    description: 'Fecha de creación del curso',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-20T15:45:00.000Z',
  })
  updatedAt?: Date;

  @ApiProperty({
    description: 'Lista de chapters del curso',
    type: [ChapterResponse],
    required: false,
  })
  chapters?: ChapterResponse[];
}

export class CourseDetailResponse extends CourseResponse {
  @ApiProperty({
    description: 'Contenido completo del curso en formato HTML o Markdown',
    example: '# Contenido completo del curso...',
    required: false,
  })
  content?: string;

  @ApiProperty({
    description: 'Duración total del curso en minutos',
    example: 120,
    required: false,
  })
  totalDuration?: number;

  @ApiProperty({
    description: 'Número total de chapters',
    example: 5,
    required: false,
  })
  totalChapters?: number;
}
