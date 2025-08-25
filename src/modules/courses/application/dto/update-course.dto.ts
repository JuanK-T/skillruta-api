import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CourseCategory } from '@prisma/client';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiPropertyOptional({
    description: 'Título del curso (opcional)',
    example: 'Curso de JavaScript Actualizado',
    maxLength: 120,
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Descripción del curso (opcional)',
    example: 'Descripción actualizada con nuevo contenido',
    maxLength: 400,
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Categoría del curso (opcional)',
    enum: CourseCategory,
    example: CourseCategory.BUSINESS,
  })
  category?: CourseCategory;

  @ApiPropertyOptional({
    description: 'URL de la imagen miniatura del curso (opcional)',
    example: 'https://ejemplo.com/nueva-miniatura.jpg',
  })
  thumbnailUrl?: string | null;
}
