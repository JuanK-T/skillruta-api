import { Role } from '../../common/types/index';

export type RegisterResponse = {
  id: string;
  email: string;
  role: Role;
};

export type LoginResponse = {
  message: 'ok';
};

export type RefreshResponse = {
  message: 'refreshed';
};
