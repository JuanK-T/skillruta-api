import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  PASSWORD_HASHER,
  PasswordHasherPort,
} from '../application/services/password-hasher.port';

@Injectable()
export class BcryptService implements PasswordHasherPort {
  async hash(raw: string): Promise<string> {
    return bcrypt.hash(raw, 10);
  }
  async compare(raw: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(raw, hashed);
  }
}

// Export provider binding
export const BcryptProvider = {
  provide: PASSWORD_HASHER,
  useClass: BcryptService,
};
