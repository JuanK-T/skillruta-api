import { UserPayload } from './index';

/**
 * Extensión de la interfaz Request de Express para incluir el usuario autenticado
 *
 * Esta extensión permite que req.user esté disponible en todos los middlewares y guards
 * con el tipo correcto de TypeScript
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * Usuario autenticado obtenido del JWT
       *
       * @type {UserPayload | undefined}
       */
      user?: UserPayload;
    }
  }
}

export {};
