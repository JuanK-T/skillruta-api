import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Role } from '../../../../common/types'; // Importa el enum Role

export class RegisterDto {
  @ApiProperty({ example: 'admin@skillruta.dev' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, example: 'Admin123!' })
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({ enum: Role, required: false })
  password!: string;

  @ApiProperty({ enum: Role, required: false })
  @IsOptional()
  @IsIn(['ADMIN', 'USER'])
  role?: Role;
}
