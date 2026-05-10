import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1715340000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE user_role AS ENUM ('user', 'admin');

      CREATE TABLE users (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email       VARCHAR(255) NOT NULL UNIQUE,
        "passwordHash" VARCHAR(255) NOT NULL,
        role        user_role NOT NULL DEFAULT 'user',
        "isLocked"  BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_users_email ON users (email);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS users;
      DROP TYPE IF EXISTS user_role;
    `);
  }
}
