import { Injectable } from '@nestjs/common';
import { ProgressInitializerPort } from '../application/ports/progress-initializer.port';

@Injectable()
export class ProgressInitializerNoop implements ProgressInitializerPort {
  async ensureProgressRowsForEnrollment(): Promise<void> {
    // TODO: De momento no hace nada. Luego lo conectas al módulo de Progress.
    return Promise.resolve();
  }
}
