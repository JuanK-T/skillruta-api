import { Role } from '../../../common/types';

export interface UserDto {
  id: string;
  email: string;
  role: Role;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
