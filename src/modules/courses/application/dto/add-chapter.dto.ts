import { IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddChapterDto {
  @ApiProperty({
    description: 'Título del capítulo',
    example: 'Introducción a la Programación',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'Número de orden del capítulo (debe ser al menos 1)',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  order!: number;

  @ApiPropertyOptional({
    description: 'URL del contenido del capítulo (opcional)',
    example: 'https://ejemplo.com/contenido-capitulo1',
    nullable: true,
  })
  @IsOptional()
  @IsUrl()
  contentUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Duración del capítulo en segundos (opcional)',
    example: 3600,
    minimum: 0,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number | null;
}
