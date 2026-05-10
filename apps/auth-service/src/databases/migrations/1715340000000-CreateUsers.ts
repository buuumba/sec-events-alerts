import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1715340000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE SCHEMA IF NOT EXISTS auth;

      CREATE TYPE auth.user_role AS ENUM ('user', 'admin');

      CREATE TABLE auth.users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email         VARCHAR(255) NOT NULL UNIQUE,
        "passwordHash" VARCHAR(255) NOT NULL,
        role          auth.user_role NOT NULL DEFAULT 'user',
        "isLocked"    BOOLEAN NOT NULL DEFAULT false,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE INDEX idx_users_email ON auth.users (email);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS auth.users;
      DROP TYPE IF EXISTS auth.user_role;
      DROP SCHEMA IF EXISTS auth;
    `);
  }
}
