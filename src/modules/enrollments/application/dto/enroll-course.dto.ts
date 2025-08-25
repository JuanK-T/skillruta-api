import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class EnrollCourseDto {
  @ApiProperty({ example: 'cuid-del-curso' })
  @IsString()
  @Length(10, 200)
  courseId!: string;
}
