import { SetMetadata } from '@nestjs/common';
import { Role } from '../../casl/action';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);