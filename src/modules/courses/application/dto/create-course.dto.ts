import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { CourseCategory } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Título del curso',
    example: 'Programación JavaScript Avanzada',
    maxLength: 120,
  })
  @IsString()
  @MaxLength(120)
  title!: string;

  @ApiPropertyOptional({
    description: 'Descripción del curso (opcional)',
    example: 'Aprende conceptos y patrones avanzados de JavaScript',
    maxLength: 400,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(400)
  description?: string | null;

  @ApiProperty({
    description: 'Categoría del curso',
    enum: CourseCategory,
    example: CourseCategory.PROGRAMMING,
  })
  @IsEnum(CourseCategory)
  category!: CourseCategory;

  @ApiPropertyOptional({
    description: 'URL de la imagen miniatura del curso (opcional)',
    example: 'https://ejemplo.com/miniatura.jpg',
    nullable: true,
  })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string | null;
}
