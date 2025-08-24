import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../../common/types';

export class RegisterResponse {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty({ enum: Role }) role!: Role;
}

export class LoginResponse {
  @ApiProperty({ example: 'ok' }) message!: string;
}

export class RefreshResponse {
  @ApiProperty({ example: 'refreshed' }) message!: string;
}

export class MeResponse {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty({ enum: Role }) role!: Role;
}

export class ErrorResponse {
  @ApiProperty({ example: 401 }) statusCode!: number;
  @ApiProperty({ example: 'Unauthorized' }) error!: string;
  @ApiProperty({ example: 'Credenciales inválidas' }) message!: string;
}
