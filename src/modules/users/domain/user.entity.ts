import { Role } from '../../../common/types';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly role: Role,
    public readonly name?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  static create(params: {
    id: string;
    email: string;
    role: Role;
    name?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    return new User(
      params.id,
      params.email,
      params.role,
      params.name,
      params.createdAt,
      params.updatedAt
    );
  }
}
