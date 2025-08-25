import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderChaptersDto {
  @ApiProperty({
    description: 'Array de IDs de capítulos en el orden deseado',
    example: ['id-capitulo-1', 'id-capitulo-2', 'id-capitulo-3'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  orderedIds!: string[];
}
