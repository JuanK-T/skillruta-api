import { IsEmail, IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { Role } from '../../../../common/types'; // Importa el enum Role

export class RegisterDto {
  @IsEmail() email!: string;
  @IsNotEmpty() password!: string;
  @IsOptional() @IsIn(['ADMIN', 'USER']) role?: Role;
}
