import { ApiProperty } from '@nestjs/swagger';

export class EnrollmentResponse {
  @ApiProperty() id!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() courseId!: string;
  @ApiProperty() enrolledAt!: Date;
}
