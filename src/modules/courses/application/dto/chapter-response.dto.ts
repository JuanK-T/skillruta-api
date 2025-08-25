import { ApiProperty } from '@nestjs/swagger';

export class ChapterResponse {
  @ApiProperty({ description: 'ID único del chapter', example: 'uuid-v4' })
  id!: string;

  @ApiProperty({
    description: 'Título del chapter',
    example: 'Introducción a los Módulos',
  })
  title!: string;

  @ApiProperty({
    description: 'Descripción del chapter',
    example: 'Aprende sobre los módulos en NestJS',
  })
  description!: string;

  @ApiProperty({
    description: 'Contenido del chapter en formato HTML o Markdown',
    example: '# Contenido del chapter...',
  })
  content!: string;

  @ApiProperty({
    description: 'Orden del chapter dentro del curso',
    example: 1,
  })
  order!: number;

  @ApiProperty({ description: 'Duración del chapter en minutos', example: 30 })
  duration!: number;

  @ApiProperty({
    description: 'Indica si el chapter está publicado',
    example: true,
  })
  isPublished!: boolean;

  @ApiProperty({
    description: 'ID del curso al que pertenece',
    example: 'course-uuid',
  })
  courseId!: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-20T15:45:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'URL del video asociado (opcional)',
    example: 'https://youtube.com/watch?v=abc123',
    required: false,
  })
  videoUrl?: string;

  @ApiProperty({
    description: 'URL de recursos adicionales (opcional)',
    example: 'https://drive.google.com/resources',
    required: false,
  })
  resourcesUrl?: string;
}

export class ChapterDetailResponse extends ChapterResponse {
  @ApiProperty({
    description: 'Objetivos de aprendizaje del chapter',
    example: ['Entender módulos', 'Crear módulos básicos'],
    type: [String],
    required: false,
  })
  learningObjectives?: string[];

  @ApiProperty({
    description: 'Prerrequisitos del chapter',
    example: ['Conocimientos básicos de JavaScript'],
    type: [String],
    required: false,
  })
  prerequisites?: string[];
}
