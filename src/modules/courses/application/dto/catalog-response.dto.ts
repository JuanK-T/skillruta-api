import { ApiProperty } from '@nestjs/swagger';
import { CourseResponse } from './course-response.dto';

export class CatalogItemResponse extends CourseResponse {
  @ApiProperty({
    description: 'Número total de estudiantes inscritos',
    example: 150,
  })
  totalStudents!: number;

  @ApiProperty({
    description: 'Rating promedio del curso',
    example: 4.5,
    required: false,
  })
  averageRating?: number;

  @ApiProperty({
    description: 'Precio del curso',
    example: 49.99,
    required: false,
  })
  price?: number;

  @ApiProperty({
    description: 'Indica si el curso es gratuito',
    example: false,
  })
  isFree!: boolean;
}

export class CatalogResponse {
  @ApiProperty({
    description: 'Lista de cursos en el catálogo',
    type: [CatalogItemResponse],
  })
  courses!: CatalogItemResponse[];

  @ApiProperty({
    description: 'Número total de cursos que coinciden con los filtros',
    example: 45,
  })
  total!: number;

  @ApiProperty({
    description: 'Número de página actual',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Tamaño de página',
    example: 12,
  })
  pageSize!: number;

  @ApiProperty({
    description: 'Número total de páginas',
    example: 4,
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Indica si hay página anterior',
    example: false,
  })
  hasPrevious!: boolean;

  @ApiProperty({
    description: 'Indica si hay página siguiente',
    example: true,
  })
  hasNext!: boolean;
}
