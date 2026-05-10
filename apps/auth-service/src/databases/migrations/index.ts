import { CreateUsers1715340000000 } from './1715340000000-CreateUsers';
import { CreateFailedLoginAttempts1715340000001 } from './1715340000001-CreateFailedLoginAttempts';
import { AddBruteForceNotifiedAt1715340000002 } from './1715340000002-AddBruteForceNotifiedAt';

export const authMigrations = [
  CreateUsers1715340000000,
  CreateFailedLoginAttempts1715340000001,
  AddBruteForceNotifiedAt1715340000002,
];
