import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from '../application/auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { User } from '../../../common/decorators/user.decorator';
import { Role, UserPayload } from '../../../common/types';

import {
  LoginResponse,
  RefreshResponse,
  RegisterResponse,
  ErrorResponse,
  MeResponse,
} from './types/responses.types';
import { AuthCookieService } from '../infrastructure/auth-cookie.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cookies: AuthCookieService
  ) {}

  @ApiOperation({ summary: 'Registro de usuario' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ description: 'Usuario creado', type: RegisterResponse })
  @ApiBadRequestResponse({
    description: 'Datos inválidos',
    type: ErrorResponse,
  })
  @ApiConflictResponse({ description: 'Email ya existe', type: ErrorResponse })
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
    const u = await this.auth.register(
      dto.email,
      dto.password,
      (dto.role as Role) ?? Role.USER
    );
    return { id: u.id, email: u.email, role: u.role };
  }

  @ApiOperation({ summary: 'Login con email/password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login ok (Set-Cookie: sr_at, sr_rt)',
    type: LoginResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas',
    type: ErrorResponse,
  })
  @ApiHeader({
    name: 'Set-Cookie',
    description: 'sr_at=<access>; sr_rt=<refresh>',
    required: false,
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResponse> {
    const u = await this.auth.validateUser(dto.email, dto.password);
    const { access, refresh } = await this.auth.issueTokenPair({
      id: u.id,
      email: u.email,
      role: u.role,
    });
    this.cookies.setAccess(res, access);
    this.cookies.setRefresh(res, refresh);
    return { message: 'ok' };
  }

  @ApiOperation({ summary: 'Rotar refresh token (por cookie sr_rt)' })
  @ApiOkResponse({
    description: 'Refresh ok (Set-Cookie: sr_at, sr_rt)',
    type: RefreshResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh inválido/ausente',
    type: ErrorResponse,
  })
  @ApiHeader({
    name: 'Set-Cookie',
    description: 'sr_at=<access>; sr_rt=<refresh>',
    required: false,
  })
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(
    @User('id') id: string,
    @User('email') email: string,
    @User('role') role: Role,
    @Res({ passthrough: true }) res: Response
  ): Promise<RefreshResponse> {
    const { access, refresh } = await this.auth.rotateRefreshToken({
      id,
      email,
      role,
    });
    this.cookies.setAccess(res, access);
    this.cookies.setRefresh(res, refresh);
    return { message: 'refreshed' };
  }

  @ApiOperation({ summary: 'Logout (revoca refresh y borra cookies)' })
  @ApiOkResponse({ description: 'Sesión cerrada', type: LoginResponse })
  @Post('logout')
  async logout(
    @User('id') userId: string | undefined,
    @Res({ passthrough: true }) res: Response
  ) {
    if (userId) await this.auth.revokeRefreshTokens(userId);
    this.cookies.clear(res);
    return { message: 'logged out' };
  }

  @ApiOperation({ summary: 'Perfil del usuario autenticado (cookie sr_at)' })
  @ApiCookieAuth()
  @ApiOkResponse({ description: 'Perfil', type: MeResponse })
  @ApiUnauthorizedResponse({
    description: 'No autenticado',
    type: ErrorResponse,
  })
  @ApiForbiddenResponse({
    description: 'Sin rol requerido',
    type: ErrorResponse,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Get('me')
  me(@User() user: UserPayload): MeResponse {
    return { id: user.id, email: user.email, role: user.role };
  }
}
